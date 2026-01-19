import type { Request, Response } from "express";
import { WidgetService } from "../services/widgetService.js";
import { MessageService } from "../services/messageService.js";
import { SenderType } from "@prisma/client";
import { SOCKET_EVENTS } from "../shared/socketEvents.js";

const widgetService = new WidgetService();
const messageService = new MessageService();

export const joinChat = async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;
    const { domainId } = req.widget!;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "이메일은 필수입니다." });
    }

    const result = await widgetService.initializeChat(email, name, domainId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// conversationId 관련 메세지 목록 조회
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.conversation!;
    const { cursor, limit } = req.query;

    // cursor는 string | undefined
    const parsedCursor = cursor ? new Date(cursor as string) : undefined;
    const take = Number(limit);

    const result = await widgetService.getMessages({
      conversationId,
      limit: take,
      ...(parsedCursor && { cursor: parsedCursor }),
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendWidgetMessage = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.conversation!;
    const { content, visitorId } = req.body;

    if (!content || !visitorId) {
      return res.status(400).json({
        success: false,
        message:
          "현재 메세지를 전송할 수 없는 상태입니다. 잠시 후 다시 시도해 주세요.",
      });
    }

    // 위젯에서 보내면, senderType은 항상 "VISITOR"
    const message = await messageService.sendMessage({
      content,
      conversationId,
      senderType: SenderType.VISITOR,
      senderId: visitorId,
    });

    // 실시간 전송
    const io = req.app.get("io");
    // 대화방에 메시지 전송
    io.to(conversationId).emit(SOCKET_EVENTS.MESSAGE_RECEIVED, message);

    const orgId = message.organizationId;
    io.to(`org_${orgId}`).emit(SOCKET_EVENTS.UPDATE_CONVERSATION_LIST, {
      conversationId,
      lastMessage: content,
      updatedAt: message.createdAt,
    });

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
