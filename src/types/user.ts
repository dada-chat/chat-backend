export interface CreateUserDto {
  email: string;
  password: string;
  name?: string | null;
  role: "ADMIN" | "MANAGER" | "AGENT";
  status: "ACTIVE" | "PENDING" | "INACTIVED";
  organizationId: string;
}
