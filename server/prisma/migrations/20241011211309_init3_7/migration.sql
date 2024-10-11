-- AlterTable
ALTER TABLE `company` ADD COLUMN `cancelable` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `companypayments` ADD COLUMN `expires` DATETIME(3) NULL;
