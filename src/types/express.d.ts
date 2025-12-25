// 유저 정보의 구조 정의
export interface AuthUser {
  userId: string;
  role: "ADMIN" | "AGENT" | "MANAGER";
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
