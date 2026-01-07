import { Router } from "express";
import {
  createOrganization,
  getOrganizations,
  getOrganizationById,
} from "../controllers/organizationController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = Router();

// 모든 조직 관련 API 미들웨어 적용
router.use(authenticateToken);

// 조직 생성 (POST /api/organizations)
router.post("/", createOrganization);

// 조직 목록 조회 (GET /api/organizations)
router.get("/", getOrganizations);

// 조직 정보 조회(단건) (GET /api/organizations/:organizationId)
router.get("/:organizationId", getOrganizationById);

export default router;
