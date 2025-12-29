import { MessageRepository } from "../repositories/messageRepository.js";
import { ConversationRepository } from "../repositories/conversationRepository.js";
import { SenderType } from "@prisma/client";

export class MessageService {
  private messageRepository = new MessageRepository();
  private conversationRepository = new ConversationRepository();

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
    return newMessage;
  }
}
