import { Router } from "express";
import { authenticateWidget } from "../middlewares/widgetAuthMiddleware.js";
import {
  joinChat,
  sendWidgetMessage,
  getMessages,
} from "../controllers/widgetController.js";
import { conversationIdParams } from "../middlewares/conversationMiddleware.js";

const router = Router();

// 위젯 설정 정보를 가져오는 API
router.get("/config", authenticateWidget, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      organizationId: req.widget?.organizationId,
    },
    message: "위젯을 사용할 수 있어요! 채팅 서비스를 이용해 보세요.",
  });
});

router.post("/init", authenticateWidget, joinChat);

router.get("/:conversationId", conversationIdParams, getMessages);

router.post(
  "/:conversationId/message",
  conversationIdParams,
  sendWidgetMessage
);

export default router;
