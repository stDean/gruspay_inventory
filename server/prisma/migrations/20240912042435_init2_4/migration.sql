/*
  Warnings:

  - Added the required column `serialNo` to the `Products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `products` ADD COLUMN `serialNo` VARCHAR(191) NOT NULL;
