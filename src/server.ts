import express from "express";
import type { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import invitationRoutes from "./routes/invitationRoutes.js";
// swagger 관련
import swaggerUi from "swagger-ui-express";
import { specs } from "./config/swagger.js";

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// 미들웨어 설정
app.use(cors()); // 다른 도메인(Next.js)에서의 요청 허용
app.use(express.json()); // JSON 바디 파싱

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// 기본 헬스체크 라우트
app.get("/", (req: Request, res: Response) => {
  res.send("Chat Service Backend is Running~~~");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/invitations", invitationRoutes);

// 서버 시작
app.listen(PORT, () => {
  console.log(`# Server listening on port: ${PORT} !!!!!!!!!!!!!!!!!!!!!!!`);
});
