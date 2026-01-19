import { ConversationRepository } from "../repositories/conversationRepository.js";
import { MessageService } from "../services/messageService.js";
import { ConversationStatus, SenderType } from "@prisma/client";
import type { AuthUser } from "../types/express.js";

export class ConversationService {
  private conversationRepository = new ConversationRepository();
  private messageService = new MessageService();

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

  async sendUserMessage({
    conversationId,
    content,
    currentUser,
  }: {
    conversationId: string;
    content: string;
    currentUser: AuthUser;
  }) {
    // 1. 권한 체크
    const conversation = await this.validateAccess(conversationId, currentUser);

    if (conversation?.status === ConversationStatus.CLOSED) {
      throw new Error("이미 종료된 대화방에는 메시지를 보낼 수 없습니다.");
    }

    // 2. 담당자 자동 배정
    if (conversation.assignedUserId !== currentUser.userId) {
      await this.assignUser(conversationId, currentUser.userId);
    }

    // 3. 메시지 생성
    return this.messageService.sendMessage({
      content,
      conversationId,
      senderType: SenderType.USER,
      senderId: currentUser.userId,
    });
  }

  async getConversationList(currentUser: AuthUser, targetOrgId: string) {
    if (
      currentUser.role !== "ADMIN" &&
      currentUser.organizationId !== targetOrgId
    ) {
      throw new Error("해당 조직의 데이터를 조회할 권한이 없습니다.");
    }
    return this.conversationRepository.findConversationListByOrganization(
      currentUser.userId,
      targetOrgId
    );
  }

  // 특정 채팅방, 메세지 내역 조회
  async getConversationDetail(
    currentUser: AuthUser,
    conversationId: string,
    options?: {
      limit: number;
      cursor?: Date;
    }
  ) {
    const conversation =
      await this.conversationRepository.findDetailWithMessages(
        conversationId,
        options
      );

    if (!conversation) {
      throw new Error("대화방을 찾을 수 없습니다.");
    }

    if (
      currentUser.role !== "ADMIN" &&
      conversation.domain.organizationId !== currentUser.organizationId
    ) {
      throw new Error("이 대화방을 조회할 권한이 없습니다.");
    }

    return conversation;
  }

  // 특정 채팅방, 상태 변경
  async changeStatus(
    currentUser: AuthUser,
    conversationId: string,
    status: ConversationStatus
  ) {
    // 1. 권한 체크
    const conversation = await this.validateAccess(conversationId, currentUser);

    // 2. 상태 업데이트
    const updatedConversation = this.conversationRepository.updateStatus(
      conversationId,
      status
    );

    return {
      ...updatedConversation,
      organizationId: conversation.domain.organizationId,
    };
  }

  // 채팅방 , 메세지 상태 읽음 처리
  async markConversationAsRead(conversationId: string, currentUser: AuthUser) {
    // 1. 권한 체크
    const conversation = await this.validateAccess(conversationId, currentUser);

    // 2. 읽음 상태 업데이트
    return this.conversationRepository.updateMessageReadStatus(
      conversationId,
      currentUser.userId
    );
  }
}
