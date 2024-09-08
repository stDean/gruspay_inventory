-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `Products_added_by_fkey`;

-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `Products_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `sales` DROP FOREIGN KEY `Sales_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `sales` DROP FOREIGN KEY `Sales_productsId_fkey`;

-- AlterTable
ALTER TABLE `products` MODIFY `companyId` VARCHAR(191) NULL,
    MODIFY `added_by` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `sales` MODIFY `productsId` VARCHAR(191) NULL,
    MODIFY `companyId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Products` ADD CONSTRAINT `Products_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Products` ADD CONSTRAINT `Products_added_by_fkey` FOREIGN KEY (`added_by`) REFERENCES `Users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sales` ADD CONSTRAINT `Sales_productsId_fkey` FOREIGN KEY (`productsId`) REFERENCES `Products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sales` ADD CONSTRAINT `Sales_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
