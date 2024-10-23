-- DropForeignKey
ALTER TABLE `Users` DROP FOREIGN KEY `Users_companyId_fkey`;

-- AlterTable
ALTER TABLE `Users` MODIFY `companyId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
