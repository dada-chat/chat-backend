import prisma from "../config/prisma.js";
import { SenderType } from "@prisma/client";

export class MessageRepository {
  async createMessage(data: {
    content: string;
    senderType: SenderType;
    senderId: string;
    conversationId: string;
  }) {
    return prisma.message.create({
      data: {
        content: data.content,
        senderType: data.senderType,
        senderId: data.senderId,
        conversationId: data.conversationId,
      },
    });
  }
}
