/*
  Warnings:

  - A unique constraint covering the columns `[invoiceNo]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `creditorId` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `invoice` ADD COLUMN `balance_due` VARCHAR(191) NULL,
    ADD COLUMN `creditorId` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` ENUM('DRAFT', 'PAID', 'OUTSTANDING') NOT NULL DEFAULT 'DRAFT';

-- CreateIndex
CREATE UNIQUE INDEX `Invoice_invoiceNo_key` ON `Invoice`(`invoiceNo`);

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_creditorId_fkey` FOREIGN KEY (`creditorId`) REFERENCES `Creditor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
