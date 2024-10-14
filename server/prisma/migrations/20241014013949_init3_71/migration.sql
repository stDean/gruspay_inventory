-- DropForeignKey
ALTER TABLE `paystackauth` DROP FOREIGN KEY `PayStackAuth_companyPaymentsId_fkey`;

-- AddForeignKey
ALTER TABLE `PayStackAuth` ADD CONSTRAINT `PayStackAuth_companyPaymentsId_fkey` FOREIGN KEY (`companyPaymentsId`) REFERENCES `CompanyPayments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
