import type { Role } from "@prisma/client";
import { InvitationRepository } from "../repositories/invitationRepository.js";
import { sendInviteMail } from "./mailService.js";
import type { AuthUser } from "../types/express.js";
import type { CreateInvitationrDto } from "../types/invitation.js";

export class InvitationService {
  private invitationRepository = new InvitationRepository();

  async sendInvitation(data: CreateInvitationrDto, inviter: AuthUser) {
    if (inviter.role !== "ADMIN" && inviter.role !== "AGENT") {
      throw new Error("초대 메일 권한이 없습니다.");
    }

    // 1. 이미 동일한 이메일로 대기 중인 초대가 있는지 확인
    const existing = await this.invitationRepository.findValidInvitation(
      data.email
    );

    if (existing) {
      throw new Error("이미 해당 이메일로 보낸 메일 내역이 있습니다.");
    }

    const targetOrganizationId =
      inviter.role === "ADMIN" && data.organizationId
        ? data.organizationId
        : inviter.organizationId;

    if (!targetOrganizationId) {
      throw new Error("organizationId가 필요합니다.");
    }

    // 2. 초대장 생성
    const invitation = await this.invitationRepository.create({
      ...data,
      organizationId: targetOrganizationId,
      invitedById: inviter.userId,
    });

    const organization = await this.invitationRepository.findByIdWithOrg(
      invitation.id
    );

    // 4. 초대 링크 생성 (프론트엔드 가입 페이지 주소 + 초대 ID)
    const inviteLink = `${process.env.CLIENT_URL}/signup?inviteId=${invitation.id}`;
    console.log(inviteLink, "-----------------------------");
    // 5. 메일 발송
    try {
      await sendInviteMail(data.email, {
        name: data.name,
        orgName: organization?.organization.name || "다다챗",
        inviteLink: inviteLink,
      });
      console.log(`[Success] 초대 메일 발송 완료: ${data.email}`);
    } catch (mailError) {
      console.error("메일 발송 실패:", mailError);
    }

    return invitation;
  }

  async getInvitationList(
    currentUser: { role: string; organizationId: string },
    status?: string,
    organizationId?: string
  ) {
    // 1. status
    let isAccepted: boolean | undefined;
    if (status === "accepted") isAccepted = true;
    else if (status === "pending") isAccepted = false;
    else isAccepted = undefined;

    // 2.organizationId
    // 관리자
    if (currentUser.role === "ADMIN") {
      return await this.invitationRepository.findAllInvitations(
        organizationId,
        isAccepted
      );
    }

    return await this.invitationRepository.findAllByOrganization(
      currentUser.organizationId,
      isAccepted
    );
  }

  // 초대 받은 정보
  async getInvitationById(id: string) {
    // 1. 우선 ID로 초대 데이터 조회
    const invitation = await this.invitationRepository.findByIdWithOrg(id);

    // 2. 초대장 자체가 없는 경우
    if (!invitation) {
      throw new Error("존재하지 않거나 만료된 초대 링크입니다.");
    }

    // 3. 이미 수락(가입 완료)된 초대장인 경우
    if (invitation.isAccepted) {
      throw new Error(
        "이미 활성화된 계정입니다. 해당 계정으로 바로 로그인 가능한 상태입니다."
      );
    }

    // 4. 모든 검증 통과 시 데이터 반환
    return invitation;
  }
}
