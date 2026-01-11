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
      });

      // Conversation의 updatedAt 갱신
      await tx.conversation.update({
        where: { id: data.conversationId },
        data: { updatedAt: new Date(), lastMessageAt: new Date() },
      });

      // 읽음 상태 업데이트
      await tx.messageReadStatus.updateMany({
        where: {
          conversationId: data.conversationId,
          readerId: data.senderId,
        },
        data: { lastReadAt: new Date() },
      });

      return newMessage;
    });
  }
}
