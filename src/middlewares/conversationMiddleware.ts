import type { Request, Response, NextFunction } from "express";

export const conversationIdParams = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { conversationId } = req.params;

  if (!conversationId) {
    return res.status(400).json({
      success: false,
      message: "채팅방 ID가 필요합니다.",
    });
  }

  next();
};
