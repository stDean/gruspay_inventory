/*
  Warnings:

  - You are about to drop the `sales` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `amountPaid` to the `Buyer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Sales` DROP FOREIGN KEY `Sales_buyerId_fkey`;

-- DropForeignKey
ALTER TABLE `Sales` DROP FOREIGN KEY `Sales_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `Sales` DROP FOREIGN KEY `Sales_productId_fkey`;

-- AlterTable
ALTER TABLE `Buyer` ADD COLUMN `amountPaid` VARCHAR(191) NOT NULL,
    ADD COLUMN `companyId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Products` ADD COLUMN `customersName` VARCHAR(191) NULL,
    ADD COLUMN `customersPhoneNo` VARCHAR(191) NULL,
    ADD COLUMN `sold` BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE `Sales`;

-- AddForeignKey
ALTER TABLE `Buyer` ADD CONSTRAINT `Buyer_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
