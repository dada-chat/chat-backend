import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/userRepository.js";
import { InvitationRepository } from "../repositories/invitationRepository.js";
import type { CreateUserDto } from "../types/user.js";
import type { AuthUser } from "../types/express.js";
import { Role, UserStatus } from "@prisma/client";

export class UserService {
  private userRepository = new UserRepository();
  private invitationRepository = new InvitationRepository();

  async registerUserInOrganization(data: CreateUserDto, currentUser: AuthUser) {
    let targetOrganizationId: string;
    let initialStatus: UserStatus = UserStatus.PENDING;

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
      status: initialStatus,
    });
  }

  async approveManager(
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

  // 초대 링크를 통한 회사 확인 및 유저 상태 변경 완료
  async registerInvitation(data: CreateUserDto) {
    // 1. 해당 이메일로 온 유효한 초대장이 있는지 확인
    const invitation = await this.invitationRepository.findValidInvitation(
      data.email,
      data.organizationId
    );

    if (!invitation) {
      throw new Error("유효한 초대 정보가 없습니다. 관리자에게 문의하세요.");
    }

    // 2. 비밀번호 해싱 및 유저 생성
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = await this.userRepository.createUser({
      ...data,
      password: hashedPassword,
      role: invitation.role, // 지정된 역할(권한) 부여
      status: UserStatus.ACTIVE, // 승인 없이 바로 사용 가능
    });

    // 3. 초대장 사용 완료 처리
    await this.invitationRepository.updateStatus(invitation.id);

    return newUser;
  }
}
