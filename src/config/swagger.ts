import swaggerJsdoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";

// ESM 환경에서 __dirname을 만드는 코드
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "DadaChat API Doc",
      version: "1.0.0",
      description: "다다챗 프로젝트 API 문서",
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "로컬 개발 서버",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  // 중요: JSDoc 주석을 읽어올 파일 위치
  apis: [
    "src/routes/*.ts",
    "src/routes/**/*.ts",
    "src/controllers/*.ts",
    "src/controllers/**/.ts",
  ],
};

export const specs = swaggerJsdoc(options);
