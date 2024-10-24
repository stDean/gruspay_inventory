/*
  Warnings:

  - Made the column `transactionCode` on table `company` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Company` MODIFY `transactionCode` VARCHAR(191) NOT NULL;
