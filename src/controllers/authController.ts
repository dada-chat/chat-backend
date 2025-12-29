import type { Request, Response } from "express";
import { AuthService } from "../services/authService.js";
import { UserService } from "../services/userService.js";
import { refreshTokenCookieOptions } from "../utils/cookieOptions.js";

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
    const { accessToken, refreshToken, user } = await authService.signin(
      req.body
    );

    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

    res.status(200).json({
      message: "로그인 성공",
      data: {
        accessToken,
        user,
      },
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

// 로그아웃
export const signout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "삭제할 리프레시 토큰을 찾을 수 없습니다.",
      });
    }

    // 리프레시 토큰 삭제
    await authService.removeRefreshToken(refreshToken);

    // 쿠키 삭제
    res.clearCookie("refreshToken", {
      path: refreshTokenCookieOptions.path,
    });

    return res.sendStatus(204);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 리프레시토큰 재발급
export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.sendStatus(401);
    }

    const { accessToken, newRefreshToken } = await authService.refreshTokens(
      refreshToken
    );

    // 새 RefreshToken 쿠키 설정
    res.cookie("refreshToken", newRefreshToken, refreshTokenCookieOptions);

    return res.status(200).json({
      accessToken,
    });
  } catch (error) {
    return res.sendStatus(401);
  }
};
