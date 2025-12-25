import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. 헤더에서 토큰 추출 (Authorization: Bearer <TOKEN>)
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "인증 토큰이 없습니다." });
  }

  // 2. 토큰 검증
  jwt.verify(
    token,
    process.env.JWT_SECRET || "your-fallback-secret",
    (err: any, user: any) => {
      if (err) {
        return res.status(403).json({ message: "유효하지 않은 토큰입니다." });
      }

      // 3. 검증된 유저 정보를 요청 객체(req)에 담아서 다음으로 넘김
      (req as any).user = user;
      next(); // 다음 단계(컨트롤러) 진행
    }
  );
};
