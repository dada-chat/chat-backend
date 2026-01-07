import prisma from "../config/prisma.js";
import { Role } from "@prisma/client";
import type { CreateUserDto } from "../types/user.js";

export class OrganizationRepository {
  // 조직 생성
  async createOrganization(name: string) {
    return prisma.organization.create({
      data: { name },
    });
  }

  // 조직 생성 및 유저 생성 : 회사조직부터 사용자 정보까지 전부 입력하는 케이스 (보류)
  async createWithUser(orgName: string, userData: CreateUserDto) {
    return prisma.$transaction(async (tx) => {
      // 1. 조직 먼저 생성
      const organization = await tx.organization.create({
        data: { name: orgName },
      });

      // 2. 생성된 조직 ID를 사용하여 유저 생성
      const user = await tx.user.create({
        data: {
          email: userData.email,
          passwordHash: userData.password,
          name: userData.name ?? null,
          role: userData.role as Role,
          organizationId: organization.id,
        },
      });

      return { organization, user };
    });
  }

  // 조직 목록 조회
  async findAllOrganizations() {
    return prisma.organization.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            users: true,
            domains: true,
          },
        },
      },
    });
  }

  async findByOrganizationId(organizationId: string) {
    return prisma.organization.findUnique({ where: { id: organizationId } });
  }
}
