import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/userRepository.js";
import { RefreshTokenRepository } from "../repositories/refreshTokenRepository.js";
import { InvitationRepository } from "../repositories/invitationRepository.js";
import { generateTokens } from "../utils/jwt.js";
import type { UserRole } from "../types/user.js";

const userRepository = new UserRepository();
const refreshTokenRepository = new RefreshTokenRepository();
const invitationRepository = new InvitationRepository();

export class AuthService {
  private async validateAndEncrypt(email: string, password: string) {
    // 1. 중복 이메일 확인
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) throw new Error("이미 존재하는 이메일입니다.");

    // 2. 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  }

  async signupAdmin(data: {
    email: string;
    password: string;
    name: string;
    organizationName: string;
  }) {
    const hashedPassword = await this.validateAndEncrypt(
      data.email,
      data.password
    );

    // 3. 레포지토리를 통한 생성
    return userRepository.createAdminWithOrganization({
      ...data,
      passwordHash: hashedPassword,
    });
  }

  async signUpWithOrganization(data: {
    email: string;
    password: string;
    name: string;
    organizationName: string;
  }) {
    if (!data.organizationName) {
      throw new Error("회사명 정보가 필요합니다.");
    }

    const hashedPassword = await this.validateAndEncrypt(
      data.email,
      data.password
    );

    // 사용
    const newUser = await userRepository.createUserWithOrganization({
      email: data.email,
      passwordHash: hashedPassword,
      name: data.name,
      organizationName: data.name,
    });

    return newUser;
  }

  async signUpByInvitation(data: {
    email: string;
    password: string;
    name: string;
    organizationName: string;
    role: UserRole;
    organizationId: string;
    invitationId: string;
  }) {
    if (!data.organizationName) {
      throw new Error("회사명 정보가 필요합니다.");
    }

    const hashedPassword = await this.validateAndEncrypt(
      data.email,
      data.password
    );

    // 초대 회원가입 경우, invitationId 유무 확인
    const invitation = await invitationRepository.findById(data.invitationId);

    if (!invitation) {
      throw new Error("유효하지 않거나 만료된 초대 메일입니다.");
    }

    // 사용자 생성 및 초대 상태 변경
    const newUser = await userRepository.createUserByInvitation({
      email: data.email,
      passwordHash: hashedPassword,
      name: data.name,
      organizationId: invitation.organizationId,
      role: data.role,
      organizationName: data.name,
      invitationId: data.invitationId,
    });

    return newUser;
  }

  async signin(data: { email: string; password: string }) {
    // 1. 유저 존재 확인
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new Error("이메일 또는 비밀번호가 일치하지 않습니다.");
    }

    // 유저 상태에 따른 에러메세지
    if (user.status === "PENDING") {
      throw new Error(
        "아직 사용 승인되지 않은 계정입니다. 관리자 승인 후 이용해주세요."
      );
    }

    if (user.status === "INACTIVED") {
      // 혹은 SUSPENDED
      throw new Error("비활성화된 계정입니다. 관리자에게 문의하세요.");
    }

    // 2. 비밀번호 비교 (입력 비번 vs DB 암호화 비번)
    const isPasswordMatch = await bcrypt.compare(
      data.password,
      user.passwordHash
    );
    if (!isPasswordMatch) {
      throw new Error("이메일 또는 비밀번호가 일치하지 않습니다.");
    }

    const { accessToken, refreshToken } = generateTokens({
      userId: user.id,
      role: user.role,
      organizationId: user.organizationId,
    });

    // 리프레시 토큰 만료일 설정 : 7일 후
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // DB에 리프레시 토큰 저장
    await refreshTokenRepository.createRefreshToken({
      refreshToken: refreshToken,
      userId: user.id,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
      },
    };
  }

  // 리프레시 토큰 삭제
  async removeRefreshToken(refreshToken: string) {
    await refreshTokenRepository.removeRefreshToken(refreshToken);
  }

  // 리프레시, (액세스) 토큰 재발급
  async refreshTokens(currentRefreshToken: string) {
    // 1. DB에서 refreshToken 조회 및 사용자 조회
    const storedToken = await refreshTokenRepository.findByRefreshToken(
      currentRefreshToken
    );

    if (!storedToken) {
      throw new Error("해당 refresh token을 찾을 수 없습니다.");
    }

    const user = await userRepository.findById(storedToken.userId);
    if (!user) {
      await refreshTokenRepository.deleteRefreshTokenByUserId(
        storedToken.userId
      );
      throw new Error("일치하는 계정을 찾을 수 없습니다.");
    }

    // 2. 만료 체크
    if (storedToken.expiresAt < new Date()) {
      await refreshTokenRepository.removeRefreshToken(currentRefreshToken);
      throw new Error("refresh token이 만료되었습니다.");
    }

    // 3. 기존 토큰 삭제
    await refreshTokenRepository.removeRefreshToken(currentRefreshToken);

    // 4. 토큰 새로 발행
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      generateTokens({
        userId: user.id,
        role: user.role,
        organizationId: user.organizationId,
      });

    // 리프레시 토큰 만료일 설정 : 7일 후
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 5. 새 refreshToken 저장
    await refreshTokenRepository.createRefreshToken({
      refreshToken: newRefreshToken,
      userId: storedToken.userId,
      expiresAt,
    });

    return {
      accessToken: newAccessToken,
      newRefreshToken,
    };
  }
}
