import prisma from "../config/prisma.js";

export class RefreshTokenRepository {
  async createRefreshToken(data: {
    refreshToken: string;
    userId: string;
    expiresAt: Date;
  }) {
    return prisma.refreshToken.create({
      data: {
        token: data.refreshToken,
        userId: data.userId,
        expiresAt: data.expiresAt,
      },
    });
  }

  async removeRefreshToken(refreshToken: string) {
    return prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  async findByRefreshToken(refreshToken: string) {
    return prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });
  }

  async deleteRefreshTokenByUserId(userId: string) {
    return prisma.refreshToken.deleteMany({
      where: { userId: userId },
    });
  }
}
