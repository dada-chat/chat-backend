import type { Request, Response } from "express";
import { OrganizationService } from "../services/organizationService.js";

const organizationService = new OrganizationService();

export const createOrganization = async (req: Request, res: Response) => {
  try {
    // 1. 현재 로그인 유저 정보
    const currentUser = req.user!;

    // 2. 서비스 로직 호출
    const newOrganization = await organizationService.registerOrganization(
      req.body,
      currentUser
    );

    res.status(201).json({
      success: true,
      message: "회사(조직)가 성공적으로 등록되었습니다.",
      data: newOrganization,
    });
  } catch (error: any) {
    // 서비스에서 던진 에러 메시지에 따라 상태 코드 분기 가능
    const status = error.message.includes("권한") ? 403 : 400;
    res.status(status).json({ message: error.message });
  }
};

export const getOrganizations = async (req: Request, res: Response) => {
  try {
    const currentUser = req.user!;

    const organizations = await organizationService.getOrganizations(
      currentUser
    );

    res.status(200).json({ success: true, data: organizations });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getOrganizationById = async (req: Request, res: Response) => {
  try {
    const { organizationId: id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "유효하지 않은 접근입니다." });
    }

    const organization = await organizationService.getOrganizationById(id);

    res.status(200).json({
      success: true,
      data: organization,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
