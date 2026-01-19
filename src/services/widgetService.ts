import { VisitorRepository } from "../repositories/visitorRepository.js";
import { ConversationRepository } from "../repositories/conversationRepository.js";
import { MessageRepository } from "../repositories/messageRepository.js";
import type { SenderType } from "@prisma/client";

export class WidgetService {
  private visitorRepository = new VisitorRepository();
  private conversationRepository = new ConversationRepository();
  private messageRepository = new MessageRepository();

  async initializeChat(
    email: string,
    name: string | undefined,
    domainId: string
  ) {
    // 1. 방문자 식별
    const visitor = await this.visitorRepository.upsertVisitor(email, name);

    // 2. 기존에 열려있는 방이 있는지 확인
    let conversation = await this.conversationRepository.findActiveConversation(
      visitor.id,
      domainId
    );

    // 3. 없다면 새로 생성
    if (!conversation) {
      conversation = await this.conversationRepository.createConversation(
        visitor.id,
        domainId
      );
    }

    return {
      visitor,
      conversation,
    };
  }

  async getMessages({
    conversationId,
    limit,
    cursor,
  }: {
    conversationId: string;
    limit: number;
    cursor?: Date;
  }) {
    // 1. 채팅방이 있는지 확인
    const conversation = await this.conversationRepository.findByIdWithDomain(
      conversationId
    );

    if (!conversation) {
      throw new Error("채팅방을 찾을 수 없습니다.");
    }

    const messageCursorResult = await this.messageRepository.findMessageList(
      conversationId,
      limit,
      cursor
    );

    return {
      conversationStatus: conversation.status,
      messageCursorResult,
    };
  }

  async sendMessage(params: {
    content: string;
    senderType: SenderType;
    senderId: string;
    conversationId: string;
  }) {
    const conversation = await this.conversationRepository.findByIdWithDomain(
      params.conversationId
    );
    if (!conversation) {
      throw new Error("채팅방을 찾을 수 없습니다.");
    }

    const newMessage = await this.messageRepository.createMessage(params);
    return {
      message: newMessage,
      conversation,
    };
  }
}
