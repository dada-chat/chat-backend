import { Router } from "express";
import { signup, signin } from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/signin", signin);

router.get("/home", authenticateToken, (req, res) => {
  res.json({ message: "인증 성공!", user: (req as any).user });
});

export default router;
