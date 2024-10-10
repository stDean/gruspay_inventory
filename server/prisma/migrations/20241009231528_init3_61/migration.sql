-- DropForeignKey
ALTER TABLE `company` DROP FOREIGN KEY `Company_companyPaymentsId_fkey`;

-- AlterTable
ALTER TABLE `company` MODIFY `companyPaymentsId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Company` ADD CONSTRAINT `Company_companyPaymentsId_fkey` FOREIGN KEY (`companyPaymentsId`) REFERENCES `CompanyPayments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
