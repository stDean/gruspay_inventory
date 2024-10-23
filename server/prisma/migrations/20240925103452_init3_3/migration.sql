-- AlterTable
ALTER TABLE `Products` ADD COLUMN `swapInId` VARCHAR(191) NULL,
    ADD COLUMN `swapOutId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Swaps` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `companyId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Products` ADD CONSTRAINT `Products_swapOutId_fkey` FOREIGN KEY (`swapOutId`) REFERENCES `Swaps`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Products` ADD CONSTRAINT `Products_swapInId_fkey` FOREIGN KEY (`swapInId`) REFERENCES `Swaps`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Swaps` ADD CONSTRAINT `Swaps_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
