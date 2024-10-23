/*
  Warnings:

  - You are about to drop the column `transactionId` on the `company` table. All the data in the column will be lost.
  - Added the required column `transactionId` to the `PayStackAuth` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Company` DROP COLUMN `transactionId`;

-- AlterTable
ALTER TABLE `PayStackAuth` ADD COLUMN `transactionId` VARCHAR(191) NOT NULL;
