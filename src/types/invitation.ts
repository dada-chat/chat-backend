import type { UserRole } from "./user.js";

export interface CreateInvitationrDto {
  email: string;
  name: string;
  role: UserRole;
  inviterId: string;
  organizationId: string;
}
