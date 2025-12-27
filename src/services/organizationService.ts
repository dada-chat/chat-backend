import { OrganizationRepository } from "../repositories/organizationRepository.js";
import { UserRepository } from "../repositories/userRepository.js";

export class OrganizationService {
  private organizationRepository = new OrganizationRepository();
  private userRepository = new UserRepository();

  // 조직 생성
  async registerOrganization(data: { name: string }, user: { role: string }) {
    if (user.role !== "ADMIN") {
      throw new Error("접근 권한이 없습니다.");
    }
    return await this.organizationRepository.createOrganization(data.name);
  }

  // 조직 목록 조회
  async getOrganizations(user: { role: string }) {
    if (user.role !== "ADMIN") {
      throw new Error("접근 권한이 없습니다.");
    }

    return await this.organizationRepository.findAllOrganizations();
  }

  // 조직 소속 유저 목록 조회
  async getUsers(
    user: { role: string; organizationId: string },
    targetOrgId?: string
  ) {
    // ADMIN인 경우, 모든 유저 조회
    if (user.role === "ADMIN") {
      if (targetOrgId) {
        return await this.userRepository.findByOrganization(targetOrgId);
      }
      return await this.userRepository.findAllUsers();
    }

    // 그 외, 해당 조직 유저들만 조회
    return await this.userRepository.findByOrganization(user.organizationId);
  }
}
