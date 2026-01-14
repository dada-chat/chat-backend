import type { ConversationStatus, SenderType } from "@prisma/client";
import prisma from "../config/prisma.js";

export class ConversationRepository {
  // 새 채팅방 생성
  async createConversation(visitorId: string, domainId: string) {
    return prisma.conversation.create({
      data: {
        visitorId,
        domainId,
        status: "OPEN",
        messages: {
          create: {
            senderType: "SYSTEM" as SenderType,
            content: "상담 채팅을 시작할 수 있어요 :)",
            senderId: "system",
          },
        },
      },
    });
  }

  // 특정 방문자의 특정 도메인 내 활성화된(OPEN) 최근 대화 조회
  async findActiveConversation(visitorId: string, domainId: string) {
    return prisma.conversation.findFirst({
      where: {
        visitorId,
        domainId,
        status: "OPEN",
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  async assignUser(conversationId: string, userId: string) {
    return prisma.conversation.update({
      where: { id: conversationId },
      data: { assignedUserId: userId },
    });
  }

  async findByIdWithDomain(conversationId: string) {
    return prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { domain: true },
    });
  }

  // 특정 조직의 대화 목록 조회
  async findConversationListByOrganization(
    userId: string,
    organizationId: string
  ) {
    const conversations = await prisma.conversation.findMany({
      where: {
        domain: {
          organizationId: organizationId,
        },
        firstMessageAt: { not: null },
      },
      include: {
        visitor: true,
        assignedUser: {
          select: { id: true, name: true },
        },
        messages: {
          where: { senderType: { not: "SYSTEM" } },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        // 담당자의 읽음 상태
        MessageReadStatus: {
          where: {
            readerId: userId,
            readerType: "USER" as SenderType,
          },
        },
      },
      orderBy: [
        { status: "asc" }, // 1순위, 활성화 상태
        { updatedAt: "desc" }, // 2순위, 최신 업데이트순
      ],
    });

    const chatListWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const myLastRead = conv.MessageReadStatus[0]?.lastReadAt;

        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderType: { not: "SYSTEM" as SenderType },
            // 읽은 시간 확인
            ...(myLastRead && {
              createdAt: { gt: myLastRead },
            }),
          },
        });

        const lastUserMessage = await prisma.message.findFirst({
          where: {
            conversationId: conv.id,
            senderType: "USER",
          },
          orderBy: { createdAt: "desc" },
        });

        const lastMessage = conv.messages[0];

        return {
          id: conv.id,
          status: conv.status,
          visitorName: conv.visitor.name,
          lastMessage: lastMessage?.content || "채팅 메세지가 없습니다.",
          lastMessageAt: conv.lastMessageAt,
          firstMessageAt: conv.firstMessageAt,
          assignedUserName: conv.assignedUser?.name,
          lastAnsweredAt: lastUserMessage?.createdAt || null,
          unreadCount,
        };
      })
    );
    return chatListWithUnread;
  }

  // 대화방 상세 및 모든 메시지 조회
  async findDetailWithMessages(
    conversationId: string,
    options?: {
      limit: number;
      cursor?: Date;
    }
  ) {
    const limit = options?.limit ?? 30;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        visitor: true, // 방문자 정보
        assignedUser: {
          select: { id: true, name: true, role: true },
        },
        domain: true, // 권한 체크(organizationId)를 위해 필요
        messages: {
          where: {
            ...(options?.cursor && {
              createdAt: { lt: options.cursor },
            }),
          },
          orderBy: { createdAt: "desc" },
          take: limit + 1,
        },
      },
    });

    if (!conversation) {
      return null;
    }

    const lastUserMessage = await prisma.message.findFirst({
      where: {
        conversationId: conversation.id,
        senderType: "USER",
      },
      orderBy: { createdAt: "desc" },
    });

    const hasMore = conversation.messages.length > limit;
    const items = hasMore
      ? conversation.messages.slice(0, limit)
      : conversation.messages;

    return {
      ...conversation,
      assignedUser: conversation.assignedUser
        ? {
            ...conversation.assignedUser,
            lastAnsweredAt: lastUserMessage?.createdAt || null,
          }
        : null,
      messages: items.reverse(),
      hasMore,
      nextCursor: hasMore ? items[0]?.createdAt : null,
    };
  }

  // 대화방 상태 변경
  async updateStatus(conversationId: string, status: ConversationStatus) {
    return await prisma.$transaction(async (tx) => {
      const conversation = await tx.conversation.update({
        where: { id: conversationId },
        data: { status },
      });

      let message;
      if (conversation.status === "CLOSED") {
        message = await tx.message.create({
          data: {
            content: "상담이 종료된 채팅방입니다. 새로운 상담을 시작해 주세요.",
            senderType: "SYSTEM",
            senderId: "system",
            conversationId: conversation.id,
          },
        });
      }

      return {
        ...conversation,
        message,
      };
    });
  }

  // 읽음 상태 관련 생성 및 업데이트
  async updateMessageReadStatus(conversationId: string, userId: string) {
    return await prisma.messageReadStatus.upsert({
      where: {
        readerId_readerType_conversationId: {
          readerId: userId,
          readerType: "USER",
          conversationId: conversationId,
        },
      },
      update: { lastReadAt: new Date() },
      create: {
        readerId: userId,
        readerType: "USER",
        conversationId: conversationId,
        lastReadAt: new Date(),
      },
    });
  }
}
