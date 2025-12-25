import prisma from "../config/prisma.js";
import { Role } from "@prisma/client";

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async createAdminWithOrganization(data: {
    email: string;
    passwordHash: string;
    name: string;
    organizationName: string;
  }) {
    // Prisma 트랜잭션을 사용하여 조직과 유저를 동시에 생성
    return prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: { name: data.organizationName },
      });

      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash,
          name: data.name,
          role: Role.ADMIN,
          organizationId: organization.id,
        },
      });

      return { user, organization };
    });
  }
}
