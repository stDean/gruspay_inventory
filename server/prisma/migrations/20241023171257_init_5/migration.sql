/*
  Warnings:

  - You are about to drop the column `transactionId` on the `paystackauth` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Company` ADD COLUMN `transactionId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `PayStackAuth` DROP COLUMN `transactionId`;
