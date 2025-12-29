import type { ConversationStatus } from "@prisma/client";
import prisma from "../config/prisma.js";

export class ConversationRepository {
  // 새 채팅방 생성
  async createConversation(visitorId: string, domainId: string) {
    return prisma.conversation.create({
      data: {
        visitorId,
        domainId,
        status: "OPEN",
      },
      include: {
        messages: true,
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
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 30,
        },
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
  async findConversationListByOrganization(organizationId: string) {
    return prisma.conversation.findMany({
      where: {
        domain: {
          organizationId: organizationId,
        },
      },
      include: {
        visitor: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: [
        { status: "asc" }, // 1순위, 활성화 상태
        { updatedAt: "desc" }, // 2순위, 최신 업데이트순
      ],
    });
  }

  // 대화방 상세 및 모든 메시지 조회
  async findDetailWithMessages(conversationId: string) {
    return prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        visitor: true, // 방문자 정보
        domain: true, // 권한 체크(organizationId)를 위해 필요
        messages: {
          orderBy: { createdAt: "desc" },
          take: 30, // 최근 30개
        },
      },
    });
  }

  // 대화방 상태 변경
  async updateStatus(conversationId: string, status: ConversationStatus) {
    return prisma.conversation.update({
      where: { id: conversationId },
      data: { status },
    });
  }
}
