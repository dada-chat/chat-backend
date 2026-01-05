export type UserRole = "ADMIN" | "MANAGER" | "AGENT";
export type UserStatus = "ACTIVE" | "PENDING" | "INACTIVED";
export interface CreateUserDto {
  email: string;
  password: string;
  name?: string | null;
  role: UserRole;
  status: UserStatus;
  organizationId: string;
}

export interface UpdateUserDto {
  name?: string;
  role?: UserRole;
  status?: UserStatus;
  organizationId?: string;
}
