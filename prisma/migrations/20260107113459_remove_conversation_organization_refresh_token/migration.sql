/*
  Warnings:

  - You are about to drop the column `refreshTokenId` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `RefreshToken` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_refreshTokenId_fkey";

-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_organizationId_fkey";

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "refreshTokenId";

-- AlterTable
ALTER TABLE "RefreshToken" DROP COLUMN "organizationId";
