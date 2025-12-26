import type { Request, Response } from "express";
import { AuthService } from "../services/authService.js";

const authService = new AuthService();

export const signupAdmin = async (req: Request, res: Response) => {
  try {
    const result = await authService.signupAdmin(req.body);

    res.status(201).json({
      message: "회원가입 성공",
      data: {
        userId: result.user.id,
        organizationId: result.organization.id,
      },
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const result = await authService.signin(req.body);

    res.status(200).json({
      message: "로그인 성공",
      data: result,
    });
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
};
