/*
  Warnings:

  - You are about to drop the column `supplierId` on the `products` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[productId]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `productId` to the `Supplier` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `Products_supplierId_fkey`;

-- AlterTable
ALTER TABLE `products` DROP COLUMN `supplierId`;

-- AlterTable
ALTER TABLE `supplier` ADD COLUMN `productId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Supplier_productId_key` ON `Supplier`(`productId`);

-- AddForeignKey
ALTER TABLE `Supplier` ADD CONSTRAINT `Supplier_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
