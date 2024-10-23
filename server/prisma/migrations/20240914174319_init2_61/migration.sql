-- AlterTable
ALTER TABLE `Supplier` ADD COLUMN `companyId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Supplier` ADD CONSTRAINT `Supplier_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
