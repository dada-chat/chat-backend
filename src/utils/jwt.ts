import type { Role } from "@prisma/client";
import jwt from "jsonwebtoken";
import type { AuthUser } from "../types/express.js";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export const generateTokens = (payload: AuthUser) => {
  const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: "30m" });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
};
