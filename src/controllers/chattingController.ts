import type { Request, Response } from "express";
import { ConversationService } from "../services/conversationService.js";

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

    if (!["OPEN", "CLOSED"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "유효하지 않은 상태값입니다." });
    }

    const updated = await conversationService.changeStatus(
      currentUser,
      conversationId!,
      status
    );

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    res.status(403).json({ success: false, message: error.message });
  }
};
