-- AlterEnum
ALTER TYPE "SenderType" ADD VALUE 'SYSTEM';

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "MessageReadStatus" (
    "id" TEXT NOT NULL,
    "readerId" TEXT NOT NULL,
    "readerType" "SenderType" NOT NULL,
    "conversationId" TEXT NOT NULL,
    "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageReadStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MessageReadStatus_conversationId_idx" ON "MessageReadStatus"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageReadStatus_readerId_readerType_conversationId_key" ON "MessageReadStatus"("readerId", "readerType", "conversationId");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- AddForeignKey
ALTER TABLE "MessageReadStatus" ADD CONSTRAINT "MessageReadStatus_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
