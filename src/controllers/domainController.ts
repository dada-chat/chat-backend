import type { Request, Response } from "express";
import { DomainService } from "../services/domainService.js";

const domainService = new DomainService();

export const addDomain = async (req: Request, res: Response) => {
  try {
    const currentUser = req.user!;
    const { domainUrl, targetOrgId } = req.body;

    const newDomain = await domainService.registerDomain(
      currentUser,
      domainUrl,
      targetOrgId
    );

    res.status(201).json({
      success: true,
      data: newDomain,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getyDomains = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const domains = await domainService.getDomains(organizationId);

    res.status(200).json({
      success: true,
      data: domains,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteDomain = async (req: Request, res: Response) => {
  try {
    const { id: domainId } = req.params;
    const currentUser = req.user!;

    if (!domainId) {
      return res.status(400).json({
        success: false,
        message: "삭제할 도메인 ID 정보를 확인해 주세요.",
      });
    }

    await domainService.removeDomain(domainId, currentUser);

    res.status(200).json({
      success: true,
      message: "도메인이 성공적으로 삭제되었습니다.",
    });
  } catch (error: any) {
    const status = error.message.includes("권한") ? 403 : 400;
    res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};
