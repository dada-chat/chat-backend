import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class DomainRepository {
  // 도메인 등록
  async createDomain(data: { domainUrl: string; organizationId: string }) {
    return prisma.domain.create({
      data: {
        domainUrl: data.domainUrl,
        organizationId: data.organizationId,
      },
    });
  }

  // 조직별 도메인 목록 조회
  async findByOrganizationId(organizationId: string) {
    return prisma.domain.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
  }

  // 모든 도메인 조회 (ADMIN용)
  async findAllDomains() {
    return prisma.domain.findMany({
      include: {
        organization: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // 특정 도메인 조회
  async findByDomainId(id: string) {
    return prisma.domain.findUnique({
      where: { id },
    });
  }

  // 조직 도메인 삭제
  async deleteDomainInOrganization(data: {
    domainId: string;
    organizationId: string;
  }) {
    const result = await prisma.domain.deleteMany({
      where: {
        id: data.domainId,
        organizationId: data.organizationId,
      },
    });

    if (result.count === 0) {
      throw new Error("삭제할 권한이 없거나 이미 존재하지 않는 도메인입니다.");
    }
    return result;
  }

  // 도메인 삭제
  async deleteDomain(domainId: string) {
    return prisma.domain.delete({
      where: { id: domainId },
    });
  }

  // 도메인 상태 변경
  async updateActiveStatus(id: string, isActive: boolean) {
    return prisma.domain.update({
      where: { id },
      data: { isActive },
    });
  }

  // siteKey로 도메인 정보 확인
  async findBySiteKey(siteKey: string) {
    return prisma.domain.findUnique({
      where: {
        siteKey,
        isActive: true,
      },
      include: { organization: true },
    });
  }
}
