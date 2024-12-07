-- DropForeignKey
ALTER TABLE `SubPaymentDate` DROP FOREIGN KEY `SubPaymentDate_creditorId_fkey`;

-- AddForeignKey
ALTER TABLE `SubPaymentDate` ADD CONSTRAINT `SubPaymentDate_creditorId_fkey` FOREIGN KEY (`creditorId`) REFERENCES `Creditor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
