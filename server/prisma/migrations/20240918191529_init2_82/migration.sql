/*
  Warnings:

  - A unique constraint covering the columns `[supplierId]` on the table `Products` will be added. If there are existing duplicate values, this will fail.
  - Made the column `supplierId` on table `products` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Products` DROP FOREIGN KEY `Products_supplierId_fkey`;

-- AlterTable
ALTER TABLE `Products` MODIFY `supplierId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Products_supplierId_key` ON `Products`(`supplierId`);

-- AddForeignKey
ALTER TABLE `Products` ADD CONSTRAINT `Products_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
