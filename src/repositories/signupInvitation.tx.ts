import { Prisma } from "@prisma/client";

export const signupInvitationTx = async (
  tx: Prisma.TransactionClient,
  data: {
    invitationId: string;
    passwordHash: string;
    name?: string;
  }
) => {
  // 1. 초대장 검증 및 업데이트
  const invitation = await tx.invitation.update({
    where: {
      id: data.invitationId,
      isAccepted: false,
    },
    data: {
      isAccepted: true,
    },
  });

  // 2. 유저 생성
  const user = await tx.user.create({
    data: {
      email: invitation.email,
      name: data.name || invitation.name,
      passwordHash: data.passwordHash,
      organizationId: invitation.organizationId,
      role: invitation.role,
      status: "ACTIVE",
    },
  });

  return user;
};
