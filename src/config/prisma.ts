import { PrismaClient } from "@prisma/client";

// PrismaClient 인스턴스 생성 : DB 접근
const prisma = new PrismaClient();

export default prisma;
