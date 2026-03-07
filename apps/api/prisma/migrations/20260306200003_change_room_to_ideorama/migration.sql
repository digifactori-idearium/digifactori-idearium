/*
  Warnings:

  - You are about to drop the column `roomId` on the `Voxel` table. All the data in the column will be lost.
  - You are about to drop the `Room` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `ideoramaId` to the `Voxel` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_userId_fkey";

-- DropForeignKey
ALTER TABLE "Voxel" DROP CONSTRAINT "Voxel_roomId_fkey";

-- AlterTable
ALTER TABLE "Voxel" DROP COLUMN "roomId",
ADD COLUMN     "ideoramaId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Room";

-- CreateTable
CREATE TABLE "Ideorama" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'New Ideorama',
    "description" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'black-orange',
    "brightness" TEXT NOT NULL DEFAULT 'bright',
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "backgroundColor" TEXT NOT NULL DEFAULT '#f0d400',
    "leftWallColor" TEXT NOT NULL DEFAULT '#f45405',
    "rightWallColor" TEXT NOT NULL DEFAULT '#e80606',
    "floorColor" TEXT NOT NULL DEFAULT '#100101',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ideorama_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Ideorama" ADD CONSTRAINT "Ideorama_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voxel" ADD CONSTRAINT "Voxel_ideoramaId_fkey" FOREIGN KEY ("ideoramaId") REFERENCES "Ideorama"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
