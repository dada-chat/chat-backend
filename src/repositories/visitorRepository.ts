import prisma from "../config/prisma.js";

export class VisitorRepository {
  async upsertVisitor(email: string, name?: string) {
    return prisma.visitor.upsert({
      where: { email },
      update: name ? { name } : {},
      create: {
        email,
        name: name ?? "Guest",
      },
    });
  }
}
