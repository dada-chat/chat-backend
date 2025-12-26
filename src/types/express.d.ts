import { Role } from "@prisma/client";

// 유저 정보의 구조 정의
export interface AuthUser {
  userId: string;
  role: Role;
  organizationId: string;
}

// 2. Express의 Request 인터페이스 확장
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
