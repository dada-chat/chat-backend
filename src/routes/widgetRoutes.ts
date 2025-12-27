import { Router } from "express";
import { authenticateWidget } from "../middlewares/widgetAuthMiddleware.js";
import { initChat } from "../controllers/widgetController.js";

const router = Router();

// 위젯 설정 정보를 가져오는 API
router.get("/config", authenticateWidget, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      organizationId: req.widget?.organizationId,
      message: "위젯 인증 성공! 채팅 서비스를 시작할 수 있습니다.",
    },
  });
});

router.post("/init", authenticateWidget, initChat);

export default router;
