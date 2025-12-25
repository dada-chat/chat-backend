import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthUser } from "../types/express.js";

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
  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) return res.sendStatus(403);

    req.user = decoded as AuthUser;
    next(); // 다음 단계(컨트롤러) 진행
  });
};
