/*
  Warnings:

  - Added the required column `pricePaid` to the `SubPaymentDate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `SubPaymentDate` ADD COLUMN `pricePaid` VARCHAR(191) NOT NULL;
