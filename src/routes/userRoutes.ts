import { Router } from "express";
import {
  createUser,
  approveUser,
  getUsers,
  updateUser,
} from "../controllers/userController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", authenticateToken, createUser);
router.patch("/approve/:userId", authenticateToken, approveUser);
router.get("/", authenticateToken, getUsers);
router.patch("/:userId", authenticateToken, updateUser);

export default router;
