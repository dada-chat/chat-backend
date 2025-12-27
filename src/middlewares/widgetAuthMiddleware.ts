import type { Request, Response, NextFunction } from "express";
import { DomainRepository } from "../repositories/domainRepository.js";

const domainRepository = new DomainRepository();

export const authenticateWidget = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const siteKey = req.headers["x-site-key"] as string;
    const origin = req.headers.origin; // 요청을 보낸 출처, origin (CORS 보안용)

    if (!siteKey) {
      return res
        .status(401)
        .json({ success: false, message: "Site Key가 없습니다." });
    }

    // 1. DB에서 해당 Site Key를 가진 도메인 조회
    const domain = await domainRepository.findBySiteKey(siteKey);

    if (!domain) {
      return res.status(403).json({
        success: false,
        message: "유효하지 않거나 비활성화된 SiteKey입니다.",
      });
    }

    // 2. origin과 domain.domainUrl 일치 여부 확인
    if (process.env.NODE_ENV === "production") {
      // 배포 환경에서
      if (!origin || !origin.includes(domain.domainUrl)) {
        return res.status(403).json({
          success: false,
          message: "허가되지 않은 도메인에서의 접근입니다.",
        });
      }
    }

    // 3. 위젯 정보를 request에 저장 (나중에 채팅 생성 시 사용)
    req.widget = {
      organizationId: domain.organizationId,
      domainId: domain.id,
    };

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "위젯 인증 과정에서 오류가 발생했습니다.",
    });
  }
};
