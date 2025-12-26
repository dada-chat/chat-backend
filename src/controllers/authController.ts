import type { Request, Response } from "express";
import { AuthService } from "../services/authService.js";
import { UserService } from "../services/userService.js";

const authService = new AuthService();
const userService = new UserService();

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

export const signupInvitation = async (req: Request, res: Response) => {
  try {
    const { invitationId, password, name } = req.body;

    const user = await userService.registerInvitation({
      invitationId,
      password,
      name,
    });

    res.status(201).json({
      success: true,
      message: "회원가입이 완료되었습니다.",
      data: { userId: user.id, email: user.email },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
