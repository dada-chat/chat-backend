import type { Request, Response } from "express";
import { ConversationService } from "../services/conversationService.js";
import { SOCKET_EVENTS } from "../shared/socketEvents.js";
import { ConversationStatus } from "@prisma/client";

const conversationService = new ConversationService();

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { content, conversationId } = req.body;
    const currentUser = req.user!;

    const message = await conversationService.sendUserMessage({
      content,
      conversationId,
      currentUser,
    });

    // 실시간 전송
    const io = req.app.get("io");
    // 해당 대화방에 메시지 전송
    io.to(conversationId).emit(SOCKET_EVENTS.MESSAGE_RECEIVED, message);
    const orgId = currentUser.organizationId;
    io.to(`org_${orgId}`).emit(SOCKET_EVENTS.UPDATE_CONVERSATION_LIST, {
      conversationId,
      lastMessage: content,
      updatedAt: message.createdAt,
    });

    res.status(201).json({ success: true, data: message });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getConversationList = async (req: Request, res: Response) => {
  try {
    const currentUser = req.user!;
    const { orgId } = req.query; // 쿼리 스트링 (?orgId=xxxx)

    let targetOrgId: string;

    // 💡 권한 및 타겟 조직 결정 로직
    if (currentUser.role === "ADMIN" && orgId) {
      targetOrgId = orgId as string;
    } else {
      targetOrgId = currentUser.organizationId;
    }

    const data = await conversationService.getConversationList(
      currentUser,
      targetOrgId
    );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(403).json({ success: false, message: error.message });
  }
};

export const getConversationDetail = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const currentUser = req.user!;

    const detail = await conversationService.getConversationDetail(
      currentUser,
      conversationId!
    );

    res.status(200).json({
      success: true,
      data: detail,
    });
  } catch (error: any) {
    const status = error.message.includes("요청하신 정보를 찾을 수 없습니다")
      ? 404
      : 403;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const updateConversationStatus = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { status } = req.body;
    const currentUser = req.user!;

    if (!Object.keys(ConversationStatus).includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "유효하지 않은 상태값입니다." });
    }

    const updated = await conversationService.changeStatus(
      currentUser,
      conversationId!,
      status
    );

    const io = req.app.get("io");
    io.to(conversationId).emit(SOCKET_EVENTS.UPDATE_CONVERSATION_STATUS, {
      conversationId,
      status: updated.status,
    });

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    res.status(403).json({ success: false, message: error.message });
  }
};
