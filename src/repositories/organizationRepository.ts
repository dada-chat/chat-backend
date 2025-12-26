import prisma from "../config/prisma.js";
import { Role } from "@prisma/client";
import type { CreateUserDto } from "../types/user.js";

export class OrganizationRepository {
  async create(name: string) {
    return prisma.organization.create({
      data: { name },
    });
  }

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

  async findAll() {
    return prisma.organization.findMany({
      orderBy: { createdAt: "desc" },
    });
  }
}
