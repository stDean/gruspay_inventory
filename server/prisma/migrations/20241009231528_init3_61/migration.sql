-- DropForeignKey
ALTER TABLE `Company` DROP FOREIGN KEY `Company_companyPaymentsId_fkey`;

-- AlterTable
ALTER TABLE `Company` MODIFY `companyPaymentsId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Company` ADD CONSTRAINT `Company_companyPaymentsId_fkey` FOREIGN KEY (`companyPaymentsId`) REFERENCES `CompanyPayments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
