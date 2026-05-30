-- CreateEnum
CREATE TYPE "Role" AS ENUM ('INTERN', 'SUPERVISOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "IntegrationType" AS ENUM ('MODEL_3D', 'SOUND', 'IMAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "AssetCategory" AS ENUM ('FOOD_AND_DRINK', 'CLUTTER', 'WEAPONS', 'TRANSPORT', 'FURNITURE_AND_DECOR', 'OBJECTS', 'NATURE', 'ANIMALS', 'BUILDINGS', 'PEOPLE_AND_CHARACTERS', 'SCENES_AND_LEVELS', 'OTHER');

-- CreateEnum
CREATE TYPE "StorageProvider" AS ENUM ('S3', 'R2', 'GCS', 'AZURE', 'MINIO', 'LOCAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pseudo" TEXT NOT NULL,
    "avatar" TEXT,
    "bio" TEXT,
    "voiceButtons" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follow" (
    "followerId" TEXT NOT NULL,
    "followedId" TEXT NOT NULL,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("followerId","followedId")
);

-- CreateTable
CREATE TABLE "Ideorama" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'New Ideorama',
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "scene" JSONB,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ideorama_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdeoramaLikes" (
    "userId" TEXT NOT NULL,
    "ideoramaId" TEXT NOT NULL,

    CONSTRAINT "IdeoramaLikes_pkey" PRIMARY KEY ("ideoramaId","userId")
);

-- CreateTable
CREATE TABLE "VoxelModel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'New Voxel Model',
    "model" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoxelModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Sans titre',
    "content" TEXT NOT NULL DEFAULT '',
    "json" JSONB,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "emoji" TEXT NOT NULL DEFAULT '📝',
    "color" TEXT NOT NULL DEFAULT '#a78bfa',
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "orgCode" INTEGER NOT NULL DEFAULT 202026,
    "orgParentalCode" INTEGER NOT NULL DEFAULT 2026,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CloudStorage" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT,
    "provider" "StorageProvider" NOT NULL DEFAULT 'LOCAL',
    "region" TEXT,
    "endpoint" TEXT,
    "bucket" TEXT,
    "accessKey" TEXT,
    "secretKey" TEXT,
    "publicUrl" TEXT,
    "settingId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CloudStorage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "settingId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "IntegrationType" NOT NULL,
    "key" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "fieldMapping" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "IntegrationType" NOT NULL DEFAULT 'OTHER',
    "category" "AssetCategory" NOT NULL DEFAULT 'OTHER',
    "tags" TEXT[],
    "file" TEXT NOT NULL,
    "thumbnail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_pseudo_key" ON "Profile"("pseudo");

-- CreateIndex
CREATE UNIQUE INDEX "CloudStorage_settingId_key" ON "CloudStorage"("settingId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "Profile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followedId_fkey" FOREIGN KEY ("followedId") REFERENCES "Profile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ideorama" ADD CONSTRAINT "Ideorama_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdeoramaLikes" ADD CONSTRAINT "IdeoramaLikes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdeoramaLikes" ADD CONSTRAINT "IdeoramaLikes_ideoramaId_fkey" FOREIGN KEY ("ideoramaId") REFERENCES "Ideorama"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoxelModel" ADD CONSTRAINT "VoxelModel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CloudStorage" ADD CONSTRAINT "CloudStorage_settingId_fkey" FOREIGN KEY ("settingId") REFERENCES "Setting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_settingId_fkey" FOREIGN KEY ("settingId") REFERENCES "Setting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
