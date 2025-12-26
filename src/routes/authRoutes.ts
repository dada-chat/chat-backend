import { Router } from "express";
import {
  signupAdmin,
  signupInvitation,
  signin,
} from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = Router();

/**
 * @swagger
 * /api/auth/adminSignup:
 *   post:
 *     summary: 관리자 회원가입
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               organizationName:
 *                 type: string
 *     responses:
 *       201:
 *         description: 성공
 */
router.post("/signup/admin", signupAdmin);
router.post("/signup/invitation", signupInvitation);

/**
 * @swagger
 * /api/auth/signin:
 *   post:
 *     summary: 로그인
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 성공
 */
router.post("/signin", signin);

router.get("/home", authenticateToken, (req, res) => {
  res.json({
    message: "인증 성공!",
    user: req.user,
  });
});

export default router;
