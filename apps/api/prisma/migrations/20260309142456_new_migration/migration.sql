/*
  Warnings:

  - Added the required column `model` to the `Ideorama` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ideorama" ADD COLUMN     "model" TEXT NOT NULL;
