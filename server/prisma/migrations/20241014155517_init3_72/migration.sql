/*
  Warnings:

  - You are about to drop the column `companyPaymentsId` on the `company` table. All the data in the column will be lost.
  - You are about to drop the column `bin` on the `paystackauth` table. All the data in the column will be lost.
  - You are about to drop the column `brand` on the `paystackauth` table. All the data in the column will be lost.
  - You are about to drop the column `channel` on the `paystackauth` table. All the data in the column will be lost.
  - You are about to drop the column `companyPaymentsId` on the `paystackauth` table. All the data in the column will be lost.
  - You are about to drop the column `country_code` on the `paystackauth` table. All the data in the column will be lost.
  - You are about to drop the column `exp_month` on the `paystackauth` table. All the data in the column will be lost.
  - You are about to drop the `companypayments` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[companyId]` on the table `PayStackAuth` will be added. If there are existing duplicate values, this will fail.
  - Made the column `companyId` on table `paystackauth` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `company` DROP FOREIGN KEY `Company_companyPaymentsId_fkey`;

-- DropForeignKey
ALTER TABLE `paystackauth` DROP FOREIGN KEY `PayStackAuth_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `paystackauth` DROP FOREIGN KEY `PayStackAuth_companyPaymentsId_fkey`;

-- AlterTable
ALTER TABLE `company` DROP COLUMN `companyPaymentsId`,
    ADD COLUMN `billingPlan` ENUM('PERSONAL', 'TEAM', 'ENTERPRISE') NOT NULL DEFAULT 'PERSONAL',
    ADD COLUMN `billingType` ENUM('MONTHLY', 'YEARLY') NOT NULL DEFAULT 'MONTHLY';

-- AlterTable
ALTER TABLE `paystackauth` DROP COLUMN `bin`,
    DROP COLUMN `brand`,
    DROP COLUMN `channel`,
    DROP COLUMN `companyPaymentsId`,
    DROP COLUMN `country_code`,
    DROP COLUMN `exp_month`,
    MODIFY `companyId` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `companypayments`;

-- CreateIndex
CREATE UNIQUE INDEX `PayStackAuth_companyId_key` ON `PayStackAuth`(`companyId`);

-- AddForeignKey
ALTER TABLE `PayStackAuth` ADD CONSTRAINT `PayStackAuth_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
