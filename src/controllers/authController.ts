import type { Request, Response } from "express";
import { AuthService } from "../services/authService.js";
import { refreshTokenCookieOptions } from "../utils/cookieOptions.js";

const authService = new AuthService();

// 내부 관리자 회원가입 (프론트 X)
export const signupAdmin = async (req: Request, res: Response) => {
  try {
    const result = await authService.signupAdmin(req.body);

    res.status(201).json({
      success: true,
      data: {
        userId: result.user.id,
        organizationId: result.organization.id,
      },
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// 일반 회원가입
export const signUpWithOrganization = async (req: Request, res: Response) => {
  try {
    const result = await authService.signUpWithOrganization(req.body);

    res.status(201).json({
      success: true,
      data: {
        userId: result.user.id,
        organizationId: result.organization.id,
      },
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// 초대 회원가입
export const signupInvitation = async (req: Request, res: Response) => {
  try {
    const result = await authService.signUpByInvitation(req.body);

    res.status(201).json({
      success: true,
      data: {
        userId: result.user.id,
        organizationId: result.invitation.organizationId,
        email: result.user.email,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// 로그인
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
