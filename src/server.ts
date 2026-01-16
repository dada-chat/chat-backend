import express from "express";
import type { Request, Response } from "express";
import { createServer } from "http"; // Node.js 기본 모듈
import { Server } from "socket.io"; // Socket.io
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import invitationRoutes from "./routes/invitationRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";
import domainRoutes from "./routes/domainRoutes.js";
import widgetRoutes from "./routes/widgetRoutes.js";
import chattingRoutes from "./routes/chattingRoutes.js";
import { SOCKET_EVENTS } from "./shared/socketEvents.js";
// swagger 관련
import swaggerUi from "swagger-ui-express";
import { specs } from "./config/swagger.js";
import path from "path";

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const isProd = process.env.NODE_ENV === "production";

// # Socket.io
// 1. HTTP 서버 생성 (app.listen 대신 사용할 서버)
const httpServer = createServer(app);

// 2. Socket.io 서버 설정
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH"],
  },
});

// 소켓 이벤트 로직
io.on("connection", (socket) => {
  console.log("신규 소켓 연결:", socket.id);

  // 특정 채팅방 입장
  socket.on(SOCKET_EVENTS.JOIN_CHATTING, (conversationId) => {
    socket.join(conversationId);
    console.log(`유저(${socket.id})의 채팅방(${conversationId}) 입장`);
  });

  // 채팅방 목록 업데이트
  socket.on(SOCKET_EVENTS.UPDATE_CONVERSATION_LIST, (orgId) => {
    socket.join(`org_${orgId}`);
    console.log(`상담원(${socket.id})이 채팅 목록(${orgId}) 확인 중`);
  });

  socket.on("disconnect", () => {
    console.log("연결 해제:", socket.id);
  });
});

// 미들웨어 설정
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      // 개발 환경(localhost)은 무조건 통과
      if (!isProd && origin.includes("localhost")) {
        return callback(null, true);
      }

      callback(null, origin);
    },
    credentials: true,
  })
);
app.use(express.json()); // JSON 바디 파싱
app.use(cookieParser());

app.set("io", io);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use("/public", express.static(path.join(process.cwd(), "src/public")));

// 기본 라우트 체크 (상태 확인)
app.get("/", (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ko">
      <head>
        <meta charset="UTF-8" />
        <title>DadaChat Backend</title>
        <style>
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont;
            background: #fff;
            color: #181818;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
          }
          .container {
            text-align: center;
          }
          h1 {
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
          }
          p {
            color:#888
          }
        </style>
      </head>
      <body>
        <div class="container">
          <img src="/public/logo.svg" alt="DadaChat Logo" />
          <h1>DadaChat Backend</h1>
          <p>Service is running successfully.</p>
        </div>
      </body>
    </html>
  `);
});

// 서버가 살아있는지 확인
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: Date.now(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/domains", domainRoutes);
app.use("/api/widget", widgetRoutes);
app.use("/api/chat", chattingRoutes);

// 서버 시작 : app.listen 대신 httpServer.listen
httpServer.listen(PORT, () => {
  console.log(`# Server listening on port: ${PORT} !!!!!!!!!!!!!!!!!!!!!!!`);
});
