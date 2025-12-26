import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/userRepository.js";
import jwt from "jsonwebtoken";

const userRepository = new UserRepository();

export class AuthService {
  async signupAdmin(data: {
    email: string;
    password: string;
    name: string;
    organizationName: string;
  }) {
    // 1. 중복 이메일 확인
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error("이미 존재하는 이메일입니다.");
    }

    // 2. 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 3. 레포지토리를 통한 생성
    return userRepository.createAdminWithOrganization({
      ...data,
      passwordHash: hashedPassword,
    });
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
        "아직 승인되지 않은 계정입니다. 관리자 승인 후 이용해주세요."
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

    // 3. JWT 토큰 발급
    const token = jwt.sign(
      { userId: user.id, role: user.role, organizationId: user.organizationId },
      process.env.JWT_SECRET || "your-fallback-secret",
      { expiresIn: "1h" } // 1시간 유효
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
