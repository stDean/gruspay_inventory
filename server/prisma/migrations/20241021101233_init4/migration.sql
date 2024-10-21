-- DropForeignKey
ALTER TABLE `buyer` DROP FOREIGN KEY `Buyer_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `creditor` DROP FOREIGN KEY `Creditor_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `supplier` DROP FOREIGN KEY `Supplier_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `swaps` DROP FOREIGN KEY `Swaps_companyId_fkey`;

-- AddForeignKey
ALTER TABLE `Swaps` ADD CONSTRAINT `Swaps_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supplier` ADD CONSTRAINT `Supplier_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Buyer` ADD CONSTRAINT `Buyer_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Creditor` ADD CONSTRAINT `Creditor_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
