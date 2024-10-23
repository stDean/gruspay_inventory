/*
  Warnings:

  - You are about to drop the column `productsId` on the `productsupplier` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[productId]` on the table `ProductSupplier` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `productId` to the `ProductSupplier` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ProductSupplier` DROP FOREIGN KEY `ProductSupplier_productsId_fkey`;

-- AlterTable
ALTER TABLE `Products` MODIFY `other_meta_data` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `ProductSupplier` DROP COLUMN `productsId`,
    ADD COLUMN `productId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `ProductSupplier_productId_key` ON `ProductSupplier`(`productId`);

-- AddForeignKey
ALTER TABLE `ProductSupplier` ADD CONSTRAINT `ProductSupplier_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
