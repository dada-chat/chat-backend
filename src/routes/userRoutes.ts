import { Router } from "express";
import { createUser, approveUser } from "../controllers/userController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", authenticateToken, createUser);
router.patch("/approve/:userId", authenticateToken, approveUser);

export default router;
