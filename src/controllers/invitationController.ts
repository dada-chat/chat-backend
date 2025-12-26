import type { Request, Response } from "express";
import { InvitationService } from "../services/invitationService.js";

const invitationService = new InvitationService();
export const createInvitation = async (req: Request, res: Response) => {
  try {
    const { email, name, role } = req.body;
    const inviter = req.user!; // 인증 미들웨어에서 넘어온 초대자 정보

    // 서비스 호출
    const invitation = await invitationService.sendInvitation({
      email,
      name,
      role,
      organizationId: inviter.organizationId,
      invitedById: inviter.userId,
    });

    res.status(201).json({
      message: "초대장이 생성되었습니다.",
      data: invitation,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getInvitations = async (req: Request, res: Response) => {
  try {
    const status = (req.query.status as string) || "all";
    const organizationId = req.user!.organizationId;

    const invitations = await invitationService.getInvitationList(
      organizationId,
      status as string
    );

    res.status(200).json({ data: invitations });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getInvitationDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "비정상적인 접근입니다." });
    }

    const invitation = await invitationService.getInvitationById(id);

    res.status(200).json({
      success: true,
      data: {
        email: invitation.email,
        name: invitation.name,
        organizationId: invitation.organizationId,
        organizationName: invitation.organization.name,
        role: invitation.role,
      },
    });
  } catch (error: any) {
    // 서비스에서 throw한 구체적인 메시지를 응답
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
