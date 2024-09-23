/*
  Warnings:

  - You are about to drop the column `amount_paid` on the `buyer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `buyer` DROP COLUMN `amount_paid`;

-- AlterTable
ALTER TABLE `products` ADD COLUMN `bought_for` VARCHAR(191) NULL;
