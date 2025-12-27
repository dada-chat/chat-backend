import { Router } from "express";
import {
  addDomain,
  getyDomains,
  deleteDomain,
  updateDomainStatus,
} from "../controllers/domainController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authenticateToken);

// 도메인 등록
router.post("/", addDomain);

// 도메인 목록 조회
router.get("/", getyDomains);

// 도메인 삭제 (/:id 형태)
router.delete("/:id", deleteDomain);

// 도메인 상태 변경
router.patch("/:id", updateDomainStatus);

export default router;
