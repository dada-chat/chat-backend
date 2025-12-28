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
}
