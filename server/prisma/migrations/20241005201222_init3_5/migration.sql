/*
  Warnings:

  - You are about to drop the column `creditor` on the `buyer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Buyer` DROP COLUMN `creditor`;

-- AlterTable
ALTER TABLE `Products` ADD COLUMN `creditorId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Creditor` (
    `id` VARCHAR(191) NOT NULL,
    `creditor_name` VARCHAR(191) NOT NULL,
    `creditor_email` VARCHAR(191) NOT NULL,
    `creditor_phone_no` VARCHAR(191) NOT NULL,
    `companyId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Creditor_creditor_email_creditor_name_companyId_key`(`creditor_email`, `creditor_name`, `companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Products` ADD CONSTRAINT `Products_creditorId_fkey` FOREIGN KEY (`creditorId`) REFERENCES `Creditor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Creditor` ADD CONSTRAINT `Creditor_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
