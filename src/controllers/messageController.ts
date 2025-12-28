import type { Request, Response } from "express";
import { MessageService } from "../services/messageService.js";
import { ConversationService } from "../services/conversationService.js";
import { SenderType } from "@prisma/client";

const messageService = new MessageService();
const conversationService = new ConversationService();

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { content, conversationId } = req.body;
    const currentUser = req.user!;

    // 1. 권한 체크 (같은 조직인가?)
    const conversation = await conversationService.validateAccess(
      conversationId,
      currentUser
    );

    // 2. 담당자가 지정되지 않았거나, 현재 상담원으로 배정/변경
    if (conversation.assignedUserId !== currentUser.userId) {
      await conversationService.assignUser(conversationId, currentUser.userId);
    }

    const message = await messageService.sendMessage({
      content,
      conversationId,
      senderType: SenderType.USER,
      senderId: currentUser.userId,
    });

    res.status(201).json({ success: true, data: message });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
