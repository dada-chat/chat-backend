import type { Request, Response } from "express";
import { UserService } from "../services/userService.js";
import type { AuthUser } from "../types/express.js";

const userService = new UserService();

export const createUser = async (req: Request, res: Response) => {
  try {
    // 1. 현재 로그인 유저 정보
    const currentUser = req.user!;

    // 2. 서비스 로직 호출
    const newUser = await userService.registerUserInOrganization(
      req.body,
      currentUser
    );

    res
      .status(201)
      .json({ message: "사용자가 성공적으로 등록되었습니다.", data: newUser });
  } catch (error: any) {
    // 서비스에서 던진 에러 메시지에 따라 상태 코드 분기 가능
    const status = error.message.includes("권한") ? 403 : 400;
    res.status(status).json({ message: error.message });
  }
};

export const approveUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "승인할 유저 ID가 필요합니다." });
    }
    const result = await userService.approveManager(userId, req.user!);
    res.status(200).json({ message: "승인 완료", data: result });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
