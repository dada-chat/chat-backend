import prisma from "../config/prisma.js";
import { Role, UserStatus } from "@prisma/client";
import type { CreateUserDto, UpdateUserDto, UserRole } from "../types/user.js";

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(userId: string) {
    return prisma.user.findUnique({ where: { id: userId } });
  }

  // 최고관리자 생성
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
          status: UserStatus.ACTIVE,
          organizationId: organization.id,
        },
      });

      return { user, organization };
    });
  }

  // 일반 회원가입
  async createUserWithOrganization(data: {
    email: string;
    passwordHash: string;
    name: string;
    organizationName: string;
  }) {
    // Prisma 트랜잭션을 사용하여 조직 & 유저 생성
    return prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: { name: data.organizationName },
      });

      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash,
          name: data.name,
          role: Role.AGENT,
          status: UserStatus.PENDING,
          organizationId: organization.id,
        },
      });

      return { user, organization };
    });
  }

  // 초대 회원가입
  async createUserByInvitation(data: {
    email: string;
    passwordHash: string;
    name: string;
    role: UserRole;
    organizationId: string;
    organizationName: string;
    invitationId: string;
  }) {
    // Prisma 트랜잭션을 사용하여 유저 생성 & 초대 상태 변경
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash,
          name: data.name,
          role: data.role as Role,
          status: UserStatus.ACTIVE,
          organizationId: data.organizationId,
        },
      });

      const invitation = await tx.invitation.update({
        where: { id: data.invitationId },
        data: { isAccepted: true },
      });

      return { user, invitation };
    });
  }

  // 관리자 이외의 유저 생성
  async createUser(data: CreateUserDto) {
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.password,
        name: data.name || null,
        role: data.role as Role,
        status: data.status as UserStatus,
        organizationId: data.organizationId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        organizationId: true,
        organization: {
          // 관계된 데이터 가져오기
          select: {
            name: true,
          },
        },
        createdAt: true,
      },
    });
  }

  // 특정 조직의 유저 조회
  async findByOrganization(organizationId: string) {
    return prisma.user.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
  }

  // 전체 유저 조회 (SUPER_ADMIN용)
  async findAllUsers() {
    return prisma.user.findMany({
      include: {
        organization: {
          select: { name: true }, // 어느 회사 소속인지 표시
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // 사용자 (계정)상태 변경
  async updateStatus(userId: string, status: UserStatus) {
    return prisma.user.update({
      where: { id: userId },
      data: { status },
    });
  }

  // 사용자 정보 수정
  async updateUserById(userId: string, data: UpdateUserDto) {
    return prisma.user.update({
      where: { id: userId },
      data,
    });
  }
}
