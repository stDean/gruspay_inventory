-- AlterTable
ALTER TABLE `Company` ADD COLUMN `canUpdate` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `PayStackAuth` MODIFY `companyId` VARCHAR(191) NULL;
