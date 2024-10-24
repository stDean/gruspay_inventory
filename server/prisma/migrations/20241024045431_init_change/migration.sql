/*
  Warnings:

  - You are about to drop the column `transactionId` on the `company` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Company` DROP COLUMN `transactionId`,
    ADD COLUMN `transactionCode` VARCHAR(191) NULL;
