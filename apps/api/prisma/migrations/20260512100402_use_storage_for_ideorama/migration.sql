/*
  Warnings:

  - Made the column `scene` on table `Ideorama` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Ideorama" ALTER COLUMN "scene" SET NOT NULL,
ALTER COLUMN "scene" SET DATA TYPE TEXT;
