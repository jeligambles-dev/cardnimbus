-- CreateTable
CREATE TABLE "category_tiles" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_tiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "category_tiles_isActive_displayOrder_idx" ON "category_tiles"("isActive", "displayOrder");
