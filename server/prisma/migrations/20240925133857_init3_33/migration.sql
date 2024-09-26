-- AlterTable
ALTER TABLE `products` ADD COLUMN `swapOutId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Products` ADD CONSTRAINT `Products_swapOutId_fkey` FOREIGN KEY (`swapOutId`) REFERENCES `Swaps`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
