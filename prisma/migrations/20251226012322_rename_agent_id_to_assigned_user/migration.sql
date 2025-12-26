/*
  Warnings:

  - You are about to drop the column `agentId` on the `Conversation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_agentId_fkey";

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "agentId",
ADD COLUMN     "assignedUserId" TEXT;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
