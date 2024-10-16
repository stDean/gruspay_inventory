-- AlterTable
ALTER TABLE `company` ADD COLUMN `canUpdate` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `paystackauth` MODIFY `companyId` VARCHAR(191) NULL;
