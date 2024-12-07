/*
  Warnings:

  - You are about to drop the column `subPayDates` on the `creditor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Creditor` DROP COLUMN `subPayDates`;

-- CreateTable
CREATE TABLE `SubPaymentDate` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `creditorId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SubPaymentDate` ADD CONSTRAINT `SubPaymentDate_creditorId_fkey` FOREIGN KEY (`creditorId`) REFERENCES `Creditor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
