import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { conversationIdParams } from "../middlewares/conversationMiddleware.js";
import {
  sendMessage,
  getConversationList,
  getConversationDetail,
  updateConversationStatus,
  markConversationAsRead,
} from "../controllers/chattingController.js";

const router = Router();

// 사용자 메시지 전송
router.post("/messages", authenticateToken, sendMessage);

// 조직의 대화 목록 조회
router.get("/conversations", authenticateToken, getConversationList);

// 특정 채팅방의 메세지 조회
router.get(
  "/conversations/:conversationId",
  authenticateToken,
  getConversationDetail
);

// 특정 채팅방 상태 변경(종료)
router.patch(
  "/conversations/:conversationId/status",
  authenticateToken,
  conversationIdParams,
  updateConversationStatus
);

//
router.post(
  "/conversations/:conversationId/read",
  authenticateToken,
  conversationIdParams,
  markConversationAsRead
);
export default router;
