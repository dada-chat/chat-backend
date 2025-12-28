import { MessageRepository } from "../repositories/messageRepository.js";
import { SenderType } from "@prisma/client";

export class MessageService {
  private messageRepository = new MessageRepository();

  async sendMessage(params: {
    content: string;
    senderType: SenderType;
    senderId: string;
    conversationId: string;
  }) {
    // 1. 메시지 저장
    const newMessage = await this.messageRepository.createMessage(params);

    // 2. 채팅방의 updatedAt 갱신 (Prisma가 자동으로 해주지만, 명시적 관리가 필요할 때 사용)
    // 3. TODO: 여기서 소켓(Socket.io)으로 실시간 알림 전송 로직이 들어올 예정입니다.

    return newMessage;
  }
}
