/*
  Warnings:

  - Made the column `companyId` on table `products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `added_by` on table `products` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `Products_added_by_fkey`;

-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `Products_companyId_fkey`;

-- AlterTable
ALTER TABLE `products` MODIFY `companyId` VARCHAR(191) NOT NULL,
    MODIFY `added_by` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Products` ADD CONSTRAINT `Products_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Products` ADD CONSTRAINT `Products_added_by_fkey` FOREIGN KEY (`added_by`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
