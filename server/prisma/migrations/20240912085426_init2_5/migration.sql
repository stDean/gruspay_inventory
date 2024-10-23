/*
  Warnings:

  - You are about to drop the `productsupplier` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `supplierPhoneNo` to the `Products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supplier_name` to the `Products` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ProductSupplier` DROP FOREIGN KEY `ProductSupplier_productId_fkey`;

-- AlterTable
ALTER TABLE `Products` ADD COLUMN `supplierEmail` VARCHAR(191) NULL,
    ADD COLUMN `supplierPhoneNo` VARCHAR(191) NOT NULL,
    ADD COLUMN `supplier_name` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `ProductSupplier`;
