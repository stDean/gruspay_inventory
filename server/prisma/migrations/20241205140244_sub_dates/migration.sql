/*
  Warnings:

  - Added the required column `subPayDates` to the `Creditor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Creditor` ADD COLUMN `subPayDates` JSON NOT NULL;
