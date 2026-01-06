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

  // 유효한 초대장 찾기
  async findValidInvitation(email: string) {
    return prisma.invitation.findFirst({
      where: {
        email,
      },
      include: {
        organization: {
          select: { name: true }, // 회사명 추가
        },
      },
    });
  }

  // 초대로 가입 완료 시, "초대 수락" 상태 변경
  async updateAsAccepted(id: string) {
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
        organization: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" }, // 최신순 정렬
    });
  }

  async findAllInvitations(
    organizationId?: string,
    isAccepted?: boolean | undefined
  ) {
    return prisma.invitation.findMany({
      where: {
        ...(organizationId && { organizationId }),
        ...(isAccepted !== undefined && { isAccepted }),
      },
      include: {
        invitedBy: {
          select: {
            name: true,
            email: true,
          },
        },
        organization: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" }, // 최신순 정렬
    });
  }

  // 초대 받은 정보 상세 조회
  async findByIdWithOrg(id: string) {
    return prisma.invitation.findUnique({
      where: { id },
      include: {
        organization: {
          select: { name: true },
        },
      },
    });
  }
}
