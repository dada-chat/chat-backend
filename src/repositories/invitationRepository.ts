import prisma from "../config/prisma.js";
import { Role } from "@prisma/client";

export class InvitationRepository {
  // 초대장 생성
  async create(data: {
    email: string;
    name: string;
    role: Role;
    organizationId: string;
    invitedById: string;
  }) {
    return prisma.invitation.create({
      data: {
        email: data.email,
        name: data.name,
        role: data.role,
        organizationId: data.organizationId,
        invitedById: data.invitedById,
        isAccepted: false,
      },
    });
  }

  // 이메일과 조직ID로 유효한 초대장 찾기
  async findValidInvitation(email: string, organizationId: string) {
    return prisma.invitation.findFirst({
      where: {
        email,
        organizationId,
        isAccepted: false,
      },
      include: {
        organization: {
          select: { name: true }, // 회사명 추가
        },
      },
    });
  }

  // 가입 완료 후 상태 변경
  async updateStatus(id: string) {
    return prisma.invitation.update({
      where: { id },
      data: { isAccepted: true },
    });
  }

  // 초대 목록
  async findAllByOrganization(organizationId: string, isAccepted?: boolean) {
    return prisma.invitation.findMany({
      where: {
        organizationId,
        ...(isAccepted !== undefined && { isAccepted }),
      },
      include: {
        invitedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" }, // 최신순 정렬
    });
  }
}
