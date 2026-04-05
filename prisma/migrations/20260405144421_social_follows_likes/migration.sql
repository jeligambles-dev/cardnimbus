-- AlterTable
ALTER TABLE "seller_profiles" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location" TEXT;

-- CreateTable
CREATE TABLE "seller_follows" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "sellerProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seller_follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_likes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "seller_follows_followerId_idx" ON "seller_follows"("followerId");

-- CreateIndex
CREATE INDEX "seller_follows_sellerProfileId_idx" ON "seller_follows"("sellerProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "seller_follows_followerId_sellerProfileId_key" ON "seller_follows"("followerId", "sellerProfileId");

-- CreateIndex
CREATE INDEX "listing_likes_userId_idx" ON "listing_likes"("userId");

-- CreateIndex
CREATE INDEX "listing_likes_listingId_idx" ON "listing_likes"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "listing_likes_userId_listingId_key" ON "listing_likes"("userId", "listingId");

-- AddForeignKey
ALTER TABLE "seller_follows" ADD CONSTRAINT "seller_follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_follows" ADD CONSTRAINT "seller_follows_sellerProfileId_fkey" FOREIGN KEY ("sellerProfileId") REFERENCES "seller_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_likes" ADD CONSTRAINT "listing_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_likes" ADD CONSTRAINT "listing_likes_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
