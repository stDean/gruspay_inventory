/*
  Warnings:

  - You are about to drop the column `productId` on the `supplier` table. All the data in the column will be lost.
  - Added the required column `supplierId` to the `Products` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `supplier` DROP FOREIGN KEY `Supplier_productId_fkey`;

-- AlterTable
ALTER TABLE `products` ADD COLUMN `supplierId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `supplier` DROP COLUMN `productId`;

-- AddForeignKey
ALTER TABLE `Products` ADD CONSTRAINT `Products_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
