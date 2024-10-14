/*
  Warnings:

  - Added the required column `customerCode` to the `PayStackAuth` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `paystackauth` ADD COLUMN `customerCode` VARCHAR(191) NOT NULL;
