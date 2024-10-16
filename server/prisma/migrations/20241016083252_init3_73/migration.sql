-- DropForeignKey
ALTER TABLE `paystackauth` DROP FOREIGN KEY `PayStackAuth_companyId_fkey`;

-- AddForeignKey
ALTER TABLE `PayStackAuth` ADD CONSTRAINT `PayStackAuth_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
