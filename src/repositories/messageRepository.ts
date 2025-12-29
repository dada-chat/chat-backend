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
              domain: {
                select: { organizationId: true },
              },
            },
          },
        },
      });

      // Conversation의 updatedAt 갱신
      await tx.conversation.update({
        where: { id: data.conversationId },
        data: { updatedAt: new Date() },
      });

      return newMessage;
    });
  }
}
