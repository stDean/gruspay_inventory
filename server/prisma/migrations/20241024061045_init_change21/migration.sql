/*
  Warnings:

  - Added the required column `transactionId` to the `PayStackAuth` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `PayStackAuth` ADD COLUMN `transactionId` VARCHAR(191) NOT NULL;
