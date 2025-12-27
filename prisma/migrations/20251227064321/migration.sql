/*
  Warnings:

  - A unique constraint covering the columns `[domainUrl]` on the table `Domain` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Domain" DROP CONSTRAINT "Domain_organizationId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "Domain_domainUrl_key" ON "Domain"("domainUrl");

-- AddForeignKey
ALTER TABLE "Domain" ADD CONSTRAINT "Domain_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
