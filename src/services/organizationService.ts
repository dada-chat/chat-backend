import { OrganizationRepository } from "../repositories/organizationRepository.js";
import { UserRepository } from "../repositories/userRepository.js";

export class OrganizationService {
  private organizationRepository = new OrganizationRepository();

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

  async getOrganizationById(id: string) {
    // 조직 데이터 조회
    const organization = await this.organizationRepository.findByOrganizationId(
      id
    );

    // 없는 경우
    if (!organization) {
      throw new Error("존재하지 않거나 유효하지 않은 접근입니다.");
    }

    // 통과 시 데이터 반환
    return organization;
  }
}
