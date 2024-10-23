-- AlterTable
ALTER TABLE `Company` ADD COLUMN `cancelable` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `CompanyPayments` ADD COLUMN `expires` DATETIME(3) NULL;
