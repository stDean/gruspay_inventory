-- DropForeignKey
ALTER TABLE `Invoice` DROP FOREIGN KEY `Invoice_creditorId_fkey`;

-- AlterTable
ALTER TABLE `Invoice` MODIFY `creditorId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_creditorId_fkey` FOREIGN KEY (`creditorId`) REFERENCES `Creditor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
