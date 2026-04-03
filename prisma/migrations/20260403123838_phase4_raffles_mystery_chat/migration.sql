-- CreateEnum
CREATE TYPE "RaffleStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'FROZEN', 'DRAWING', 'COMPLETED', 'CANCELLED', 'PRIZE_SHIPPED');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('RESERVED', 'CONFIRMED', 'EXPIRED', 'VOIDED');

-- CreateEnum
CREATE TYPE "RafflePurchaseStatus" AS ENUM ('INITIATED', 'AUTHORIZED', 'CONFIRMED', 'FAILED', 'VOIDED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "VisibilityMode" AS ENUM ('PUBLIC_NAMES', 'PARTIAL', 'ANONYMOUS');

-- CreateEnum
CREATE TYPE "MysteryCollectionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'LOW_STOCK', 'SOLD_OUT', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MysteryPurchaseStatus" AS ENUM ('INITIATED', 'CONFIRMED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "SupportConversationStatus" AS ENUM ('OPEN', 'WAITING_ON_CUSTOMER', 'WAITING_ON_AGENT', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "SupportPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "SupportSenderType" AS ENUM ('CUSTOMER', 'AGENT', 'SYSTEM', 'BOT');

-- CreateEnum
CREATE TYPE "SupportMessageType" AS ENUM ('TEXT', 'IMAGE', 'FILE', 'SYSTEM_MSG', 'AUTO_REPLY');

-- CreateTable
CREATE TABLE "raffles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "prizeImages" TEXT[],
    "prizeValue" DOUBLE PRECISION NOT NULL,
    "ticketPrice" DOUBLE PRECISION NOT NULL,
    "totalSlots" INTEGER NOT NULL,
    "filledSlots" INTEGER NOT NULL DEFAULT 0,
    "maxTicketsPerUser" INTEGER NOT NULL DEFAULT 1,
    "minFillThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "status" "RaffleStatus" NOT NULL DEFAULT 'DRAFT',
    "drawMethod" TEXT,
    "winnerId" TEXT,
    "winningTicketNumber" INTEGER,
    "drawnAt" TIMESTAMP(3),
    "randomSeed" TEXT,
    "drawReference" TEXT,
    "legalRegionRestriction" TEXT,
    "publishedTermsVersion" TEXT,
    "visibilityMode" "VisibilityMode" NOT NULL DEFAULT 'PUBLIC_NAMES',
    "cancelReason" TEXT,
    "prizeOrderId" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "raffles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raffle_purchases" (
    "id" TEXT NOT NULL,
    "raffleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentId" TEXT,
    "status" "RafflePurchaseStatus" NOT NULL DEFAULT 'INITIATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "raffle_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raffle_tickets" (
    "id" TEXT NOT NULL,
    "raffleId" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ticketNumber" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "raffle_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_reservations" (
    "id" TEXT NOT NULL,
    "raffleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'RESERVED',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mystery_collections" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currentVersionId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mystery_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mystery_collection_versions" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "pullRates" JSONB NOT NULL,
    "guaranteedMinValue" DOUBLE PRECISION NOT NULL,
    "valueLockedAt" TIMESTAMP(3),
    "stockRemaining" INTEGER NOT NULL DEFAULT 0,
    "status" "MysteryCollectionStatus" NOT NULL DEFAULT 'DRAFT',
    "effectiveFrom" TIMESTAMP(3),
    "activatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mystery_collection_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mystery_pool_items" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "productId" TEXT,
    "cardId" TEXT,
    "tierName" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "lockedValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "mystery_pool_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mystery_purchases" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentId" TEXT,
    "status" "MysteryPurchaseStatus" NOT NULL DEFAULT 'INITIATED',
    "pricePaid" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mystery_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mystery_pulls" (
    "id" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tierRolled" TEXT NOT NULL,
    "poolItemId" TEXT NOT NULL,
    "revealedItemName" TEXT NOT NULL,
    "revealedItemImage" TEXT,
    "revealedItemValue" DOUBLE PRECISION NOT NULL,
    "pulledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mystery_pulls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "visitorId" TEXT,
    "assignedAgentId" TEXT,
    "status" "SupportConversationStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "SupportPriority" NOT NULL DEFAULT 'NORMAL',
    "priorityReason" TEXT,
    "routingReason" TEXT,
    "category" TEXT,
    "tags" TEXT[],
    "subject" TEXT,
    "sourcePageUrl" TEXT,
    "sourceType" TEXT,
    "lastMessageAt" TIMESTAMP(3),
    "lastCustomerMessageAt" TIMESTAMP(3),
    "lastAgentMessageAt" TIMESTAMP(3),
    "botResolvedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "closedReason" TEXT,
    "satisfactionRating" INTEGER,
    "csatComment" TEXT,

    CONSTRAINT "support_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT,
    "senderType" "SupportSenderType" NOT NULL,
    "messageType" "SupportMessageType" NOT NULL DEFAULT 'TEXT',
    "content" TEXT NOT NULL,
    "attachments" TEXT[],
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_internal_notes" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_internal_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_transfer_logs" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "fromAgentId" TEXT NOT NULL,
    "toAgentId" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_transfer_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canned_responses" (
    "id" TEXT NOT NULL,
    "shortcut" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canned_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "raffles_status_idx" ON "raffles"("status");

-- CreateIndex
CREATE INDEX "raffle_purchases_raffleId_idx" ON "raffle_purchases"("raffleId");

-- CreateIndex
CREATE INDEX "raffle_purchases_userId_idx" ON "raffle_purchases"("userId");

-- CreateIndex
CREATE INDEX "raffle_tickets_userId_idx" ON "raffle_tickets"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "raffle_tickets_raffleId_ticketNumber_key" ON "raffle_tickets"("raffleId", "ticketNumber");

-- CreateIndex
CREATE INDEX "ticket_reservations_raffleId_idx" ON "ticket_reservations"("raffleId");

-- CreateIndex
CREATE INDEX "ticket_reservations_userId_idx" ON "ticket_reservations"("userId");

-- CreateIndex
CREATE INDEX "mystery_collection_versions_collectionId_idx" ON "mystery_collection_versions"("collectionId");

-- CreateIndex
CREATE INDEX "mystery_pool_items_versionId_idx" ON "mystery_pool_items"("versionId");

-- CreateIndex
CREATE INDEX "mystery_purchases_userId_idx" ON "mystery_purchases"("userId");

-- CreateIndex
CREATE INDEX "mystery_purchases_collectionId_idx" ON "mystery_purchases"("collectionId");

-- CreateIndex
CREATE UNIQUE INDEX "mystery_pulls_purchaseId_key" ON "mystery_pulls"("purchaseId");

-- CreateIndex
CREATE INDEX "mystery_pulls_userId_idx" ON "mystery_pulls"("userId");

-- CreateIndex
CREATE INDEX "support_conversations_status_idx" ON "support_conversations"("status");

-- CreateIndex
CREATE INDEX "support_conversations_userId_idx" ON "support_conversations"("userId");

-- CreateIndex
CREATE INDEX "support_messages_conversationId_idx" ON "support_messages"("conversationId");

-- CreateIndex
CREATE INDEX "support_internal_notes_conversationId_idx" ON "support_internal_notes"("conversationId");

-- CreateIndex
CREATE INDEX "support_transfer_logs_conversationId_idx" ON "support_transfer_logs"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "canned_responses_shortcut_key" ON "canned_responses"("shortcut");

-- AddForeignKey
ALTER TABLE "raffles" ADD CONSTRAINT "raffles_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raffle_purchases" ADD CONSTRAINT "raffle_purchases_raffleId_fkey" FOREIGN KEY ("raffleId") REFERENCES "raffles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raffle_purchases" ADD CONSTRAINT "raffle_purchases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raffle_tickets" ADD CONSTRAINT "raffle_tickets_raffleId_fkey" FOREIGN KEY ("raffleId") REFERENCES "raffles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raffle_tickets" ADD CONSTRAINT "raffle_tickets_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "raffle_purchases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raffle_tickets" ADD CONSTRAINT "raffle_tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_reservations" ADD CONSTRAINT "ticket_reservations_raffleId_fkey" FOREIGN KEY ("raffleId") REFERENCES "raffles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_reservations" ADD CONSTRAINT "ticket_reservations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mystery_collection_versions" ADD CONSTRAINT "mystery_collection_versions_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "mystery_collections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mystery_pool_items" ADD CONSTRAINT "mystery_pool_items_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "mystery_collection_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mystery_purchases" ADD CONSTRAINT "mystery_purchases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mystery_purchases" ADD CONSTRAINT "mystery_purchases_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "mystery_collections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mystery_purchases" ADD CONSTRAINT "mystery_purchases_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "mystery_collection_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mystery_pulls" ADD CONSTRAINT "mystery_pulls_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "mystery_purchases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mystery_pulls" ADD CONSTRAINT "mystery_pulls_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "mystery_collection_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mystery_pulls" ADD CONSTRAINT "mystery_pulls_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "support_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_internal_notes" ADD CONSTRAINT "support_internal_notes_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "support_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_transfer_logs" ADD CONSTRAINT "support_transfer_logs_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "support_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
