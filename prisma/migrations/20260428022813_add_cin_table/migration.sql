-- CreateTable
CREATE TABLE "cins" (
    "id" TEXT NOT NULL,
    "cinPhotoUrl" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cins_userId_key" ON "cins"("userId");

-- AddForeignKey
ALTER TABLE "cins" ADD CONSTRAINT "cins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
