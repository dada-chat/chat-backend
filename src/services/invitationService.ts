import type { Role } from "@prisma/client";
import { InvitationRepository } from "../repositories/invitationRepository.js";

export class InvitationService {
  private invitationRepository = new InvitationRepository();

  async sendInvitation(data: {
    email: string;
    name: string;
    role: Role;
    organizationId: string;
    invitedById: string;
  }) {
    // 1. 이미 해당 조직에 동일한 이메일로 대기 중인 초대가 있는지 확인
    const existing = await this.invitationRepository.findValidInvitation(
      data.email,
      data.organizationId
    );

    if (existing) {
      throw new Error("이미 해당 이메일로 보낸 메일 내역이 있습니다.");
    }

    // 2. 초대장 생성
    return await this.invitationRepository.create(data);
  }

  async getInvitationList(organizationId: string, filter: string) {
    switch (filter) {
      case "accepted": // 수락 완료
        return await this.invitationRepository.findAllByOrganization(
          organizationId,
          true
        );
      case "pending": // 미수락
        return await this.invitationRepository.findAllByOrganization(
          organizationId,
          false
        );
      case "all": // 전체
      default:
        return await this.invitationRepository.findAllByOrganization(
          organizationId
        );
    }
  }
}
