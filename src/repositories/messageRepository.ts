import prisma from "../config/prisma.js";
import { SenderType } from "@prisma/client";
export class MessageRepository {
  async createMessage(data: {
    content: string;
    senderType: SenderType;
    senderId: string;
    conversationId: string;
  }) {
    return await prisma.$transaction(async (tx) => {
      const newMessage = await tx.message.create({
        data: {
          content: data.content,
          senderType: data.senderType,
          senderId: data.senderId,
          conversationId: data.conversationId,
        },
        include: {
          conversation: {
            select: {
              firstMessageAt: true,
              domain: { select: { organizationId: true } },
            },
          },
        },
      });

      // 업데이트 필드 조건 추가
      const updateConversationData = {
        updatedAt: new Date(),

        ...(data.senderType !== "SYSTEM" && {
          lastMessageAt: new Date(),

          ...(newMessage.conversation.firstMessageAt
            ? {}
            : { firstMessageAt: new Date() }),
        }),
      };

      // Conversation의 updatedAt 갱신
      await tx.conversation.update({
        where: { id: data.conversationId },
        data: updateConversationData,
      });

      // 읽음 상태 업데이트
      await tx.messageReadStatus.updateMany({
        where: {
          conversationId: data.conversationId,
          readerId: data.senderId,
        },
        data: { lastReadAt: new Date() },
      });

      return {
        id: newMessage.id,
        content: newMessage.content,
        senderType: newMessage.senderType,
        senderId: newMessage.senderId,
        createdAt: newMessage.createdAt,
        organizationId: newMessage.conversation.domain.organizationId,
      };
    });
  }

  // conversationId로 메세지 목록 조회
  async findMessageList(conversationId: string) {
    return prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
  }
}
