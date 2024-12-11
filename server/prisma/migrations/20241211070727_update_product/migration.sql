/*
  Warnings:

  - Made the column `createdAt` on table `products` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Products` ADD COLUMN `purchase_date` DATETIME(3) NULL,
    MODIFY `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
