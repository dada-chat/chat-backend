import { ConversationRepository } from "../repositories/conversationRepository.js";
import { SenderType } from "@prisma/client";

export class ConversationService {
  private conversationRepository = new ConversationRepository();

  async assignUser(conversationId: string, userId: string) {
    return this.conversationRepository.assignUser(conversationId, userId);
  }

  async validateAccess(
    conversationId: string,
    user: { userId: string; role: string; organizationId: string }
  ) {
    const conversation = await this.conversationRepository.findByIdWithDomain(
      conversationId
    );

    if (!conversation) {
      throw new Error("채팅방을 찾을 수 없습니다.");
    }

    // 1. ADMIN은 모든 방 접근 가능
    if (user.role === "ADMIN") {
      return conversation;
    }

    // 2. 조직 검증
    if (conversation.domain.organizationId !== user.organizationId) {
      throw new Error("해당 조직의 상담원만 접근 가능합니다.");
    }

    return conversation;
  }
}
