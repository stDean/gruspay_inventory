/*
  Warnings:

  - You are about to drop the column `payment_plan` on the `company` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[companyPaymentsId]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `companyPaymentsId` to the `Company` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Company_company_name_key` ON `Company`;

-- AlterTable
ALTER TABLE `Company` DROP COLUMN `payment_plan`,
    ADD COLUMN `companyPaymentsId` VARCHAR(191) NOT NULL,
    ADD COLUMN `paymentStatus` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'INACTIVE';

-- CreateTable
CREATE TABLE `CompanyPayments` (
    `id` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `plan` ENUM('FREE', 'PERSONAL', 'TEAM', 'ENTERPRISE') NOT NULL DEFAULT 'PERSONAL',
    `billType` ENUM('MONTHLY', 'YEARLY') NOT NULL DEFAULT 'MONTHLY',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PayStackAuth` (
    `id` VARCHAR(191) NOT NULL,
    `authorization_code` VARCHAR(191) NOT NULL,
    `card_type` VARCHAR(191) NOT NULL,
    `last4` VARCHAR(191) NOT NULL,
    `exp_month` VARCHAR(191) NOT NULL,
    `exp_year` VARCHAR(191) NOT NULL,
    `bin` VARCHAR(191) NOT NULL,
    `bank` VARCHAR(191) NOT NULL,
    `channel` VARCHAR(191) NOT NULL,
    `signature` VARCHAR(191) NOT NULL,
    `reusable` BOOLEAN NOT NULL,
    `country_code` VARCHAR(191) NOT NULL,
    `account_name` VARCHAR(191) NULL,
    `companyPaymentsId` VARCHAR(191) NULL,
    `companyId` VARCHAR(191) NULL,

    UNIQUE INDEX `PayStackAuth_authorization_code_key`(`authorization_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Company_companyPaymentsId_key` ON `Company`(`companyPaymentsId`);

-- AddForeignKey
ALTER TABLE `Company` ADD CONSTRAINT `Company_companyPaymentsId_fkey` FOREIGN KEY (`companyPaymentsId`) REFERENCES `CompanyPayments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayStackAuth` ADD CONSTRAINT `PayStackAuth_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayStackAuth` ADD CONSTRAINT `PayStackAuth_companyPaymentsId_fkey` FOREIGN KEY (`companyPaymentsId`) REFERENCES `CompanyPayments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
