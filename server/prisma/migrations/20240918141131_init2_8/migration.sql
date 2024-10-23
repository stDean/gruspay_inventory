/*
  Warnings:

  - You are about to drop the column `sold` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Products` DROP COLUMN `sold`,
    ADD COLUMN `salesStatus` ENUM('SOLD', 'SWAP', 'NOT_SOLD') NOT NULL DEFAULT 'NOT_SOLD',
    ADD COLUMN `sold_by` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Products` ADD CONSTRAINT `Products_sold_by_fkey` FOREIGN KEY (`sold_by`) REFERENCES `Users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
