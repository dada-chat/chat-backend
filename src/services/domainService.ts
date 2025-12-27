import { DomainRepository } from "../repositories/domainRepository.js";

export class DomainService {
  private domainRepository = new DomainRepository();

  async registerDomain(
    currentUser: { role: string; organizationId: string },
    domainUrl: string,
    targetOrgId?: string
  ) {
    // 간단한 URL 형식 검증
    if (!domainUrl.startsWith("http")) {
      throw new Error("도메인은 http:// 또는 https://로 시작해야 합니다.");
    }

    let finalOrgId: string;

    // 권한에 따른 조직 ID 값
    if (currentUser.role === "ADMIN") {
      // ADMIN의 경우 특정 조직 ID 및 본인 소속 모두 가능
      finalOrgId = targetOrgId || currentUser.organizationId;
    } else {
      // AGENT/MANAGER는 무조건 본인 소속 조직 ID만 사용
      finalOrgId = currentUser.organizationId;
    }

    return await this.domainRepository.createDomain({
      domainUrl,
      organizationId: finalOrgId,
    });
  }

  async getDomains(currentUser: { role: string; organizationId: string }) {
    if (currentUser.role === "ADMIN") {
      return await this.domainRepository.findAllDomains();
    }

    return await this.domainRepository.findByOrganizationId(
      currentUser.organizationId
    );
  }

  async removeDomain(
    domainId: string,
    currentUser: { role: string; organizationId: string }
  ) {
    const domain = await this.domainRepository.findByDomainId(domainId);
    if (!domain) {
      throw new Error("삭제하려는 도메인을 찾을 수 없습니다.");
    }

    if (currentUser.role === "ADMIN") {
      return await this.domainRepository.deleteDomain(domainId);
    }

    if (currentUser.role === "AGENT") {
      if (domain.organizationId !== currentUser.organizationId) {
        throw new Error("본인 조직의 도메인만 삭제할 수 있습니다.");
      }
      return await this.domainRepository.deleteDomainInOrganization({
        domainId,
        organizationId: currentUser.organizationId,
      });
    }

    throw new Error("삭제할 권한이 없습니다.");
  }

  async toggleDomainActive(
    domainId: string,
    currentUser: { role: string; organizationId: string }
  ) {
    const domain = await this.domainRepository.findByDomainId(domainId);

    if (!domain) throw new Error("도메인을 찾을 수 없습니다.");

    if (
      currentUser.role !== "ADMIN" &&
      domain.organizationId !== currentUser.organizationId
    ) {
      throw new Error("상태를 변경할 권한이 없습니다.");
    }

    return await this.domainRepository.updateActiveStatus(
      domainId,
      !domain.isActive
    );
  }
}
