/*
  Warnings:

  - You are about to drop the column `swapsId` on the `products` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `Products_swapsId_fkey`;

-- AlterTable
ALTER TABLE `products` DROP COLUMN `swapsId`,
    ADD COLUMN `swapsInId` VARCHAR(191) NULL,
    ADD COLUMN `swapsOutId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Products` ADD CONSTRAINT `Products_swapsInId_fkey` FOREIGN KEY (`swapsInId`) REFERENCES `Swaps`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Products` ADD CONSTRAINT `Products_swapsOutId_fkey` FOREIGN KEY (`swapsOutId`) REFERENCES `Swaps`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
