import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/userRepository.js";
import { OrganizationRepository } from "../repositories/organizationRepository.js";
import { signupInvitationTx } from "../repositories/signupInvitation.tx.js";
import type { CreateUserDto, UpdateUserDto } from "../types/user.js";
import type { AuthUser } from "../types/express.js";
import { Role, UserStatus } from "@prisma/client";
import prisma from "../config/prisma.js";

export class UserService {
  private userRepository = new UserRepository();
  private organizationRepository = new OrganizationRepository();

  async registerUserInOrganization(data: CreateUserDto, currentUser: AuthUser) {
    let targetOrganizationId: string;

    // 1. 권한 체크 계층 구조
    if (currentUser.role === "ADMIN") {
      if (!data.organizationId)
        throw new Error("최고 관리자는 조직 ID를 지정해야 합니다.");
      targetOrganizationId = data.organizationId;
    } else if (currentUser.role === "AGENT") {
      targetOrganizationId = currentUser.organizationId;

      // AGENT가 ADMIN을 만드려고 한다면, 시도 차단
      if (data.role === "ADMIN")
        throw new Error("에이전트는 최고 관리자를 생성할 수 없습니다.");
    } else {
      throw new Error("유저 생성 권한이 없습니다.");
    }

    // 2. 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 3. 데이터 레이어 호출
    return await this.userRepository.createUser({
      ...data,
      password: hashedPassword,
      organizationId: targetOrganizationId,
    });
  }

  async approveStatusChange(
    targetUserId: string,
    agentUser: { organizationId: string; role: Role }
  ) {
    // 1. 권한 확인: AGENT 이상만 승인 가능
    if (agentUser.role !== "ADMIN" && agentUser.role !== "AGENT") {
      throw new Error("승인 권한이 없습니다.");
    }

    // 2. 대상 유저 확인
    const targetUser = await this.userRepository.findById(targetUserId);
    if (!targetUser || targetUser.organizationId !== agentUser.organizationId) {
      throw new Error("우리 조직의 유저가 아닙니다.");
    }

    // 3. 상태 업데이트
    return await this.userRepository.updateStatus(targetUserId, "ACTIVE");
  }

  async registerInvitation(data: {
    invitationId: string;
    password: string;
    name: string;
  }) {
    const passwordHash = await bcrypt.hash(data.password, 10);

    return prisma.$transaction(async (tx) => {
      try {
        return await signupInvitationTx(tx, {
          invitationId: data.invitationId,
          passwordHash,
          name: data.name,
        });
      } catch {
        throw new Error("유효하지 않거나 이미 사용된 초대장입니다.");
      }
    });
  }

  // 유저 목록 조회
  async getUsers(user: { role: string; organizationId: string }) {
    // ADMIN인 경우, 모든 유저
    if (user.role === "ADMIN") {
      return await this.userRepository.findAllUsers();
    }

    // 그 외, 해당 조직 유저들만 반환
    return await this.userRepository.findByOrganization(user.organizationId);
  }
  async updateUser(
    userId: string,
    payload: UpdateUserDto,
    currentUser: { role: Role }
  ) {
    if (Object.keys(payload).length === 0) {
      throw new Error("수정할 항목이 없습니다.");
    }

    if (currentUser.role !== "ADMIN" && currentUser.role !== "AGENT") {
      throw new Error("승인 권한이 없습니다.");
    }

    // 사용자 존재 여부
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    if (payload.organizationId) {
      // 조직 존재 여부
      const organization =
        await this.organizationRepository.findByOrganizationId(
          payload.organizationId
        );
      if (!organization) {
        throw new Error("존재하지 않는 조직 ID입니다.");
      }
    }

    return await this.userRepository.updateUserById(userId, payload);
  }
}
