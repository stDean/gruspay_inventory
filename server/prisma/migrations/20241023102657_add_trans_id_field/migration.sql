/*
  Warnings:

  - You are about to drop the column `transId` on the `company` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Company` DROP COLUMN `transId`,
    ADD COLUMN `transactionId` VARCHAR(191) NULL;
