import type { Request, Response } from "express";
import { WidgetService } from "../services/widgetService.js";

const widgetService = new WidgetService();

export const initChat = async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;
    const { domainId } = req.widget!;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "이메일은 필수입니다." });
    }

    const result = await widgetService.initializeChat(email, name, domainId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
