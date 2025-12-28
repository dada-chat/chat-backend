import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { sendMessage } from "../controllers/messageController.js";

const router = Router();

// 상담원 권한이 있는 유저만 메시지 전송 가능
router.post("/messages", authenticateToken, sendMessage);

export default router;
