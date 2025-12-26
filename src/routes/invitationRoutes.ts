import { Router } from "express";
import {
  createInvitation,
  getInvitations,
} from "../controllers/invitationController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = Router();

// 초대장 발송(생성)
router.post("/", authenticateToken, createInvitation);

// 초대장 목록 조회 (status=all | pending | accepted)
router.get("/", authenticateToken, getInvitations);

export default router;
