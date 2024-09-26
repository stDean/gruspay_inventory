-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `Products_swapInId_fkey`;

-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `Products_swapOutId_fkey`;

-- AddForeignKey
ALTER TABLE `Products` ADD CONSTRAINT `Products_swapOutId_fkey` FOREIGN KEY (`swapOutId`) REFERENCES `Swaps`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Products` ADD CONSTRAINT `Products_swapInId_fkey` FOREIGN KEY (`swapInId`) REFERENCES `Swaps`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
