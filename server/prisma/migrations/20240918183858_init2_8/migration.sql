/*
  Warnings:

  - You are about to drop the column `full_name` on the `buyer` table. All the data in the column will be lost.
  - You are about to drop the column `phone_number` on the `buyer` table. All the data in the column will be lost.
  - You are about to drop the column `customersName` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `customersPhoneNo` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `other_meta_data` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `salesStatus` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `serialNo` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `supplierEmail` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `supplierPhoneNo` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `supplier_name` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `supplier` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `supplier` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNo` on the `supplier` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Buyer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serial_no]` on the table `Products` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[supplier_name]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `buyer_name` to the `Buyer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buyer_phone_no` to the `Buyer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serial_no` to the `Products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supplier_name` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supplier_phone_no` to the `Supplier` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Products_serialNo_key` ON `products`;

-- DropIndex
DROP INDEX `Supplier_name_key` ON `supplier`;

-- AlterTable
ALTER TABLE `buyer` DROP COLUMN `full_name`,
    DROP COLUMN `phone_number`,
    ADD COLUMN `buyer_name` VARCHAR(191) NOT NULL,
    ADD COLUMN `buyer_phone_no` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `products` DROP COLUMN `customersName`,
    DROP COLUMN `customersPhoneNo`,
    DROP COLUMN `other_meta_data`,
    DROP COLUMN `salesStatus`,
    DROP COLUMN `serialNo`,
    DROP COLUMN `supplierEmail`,
    DROP COLUMN `supplierPhoneNo`,
    DROP COLUMN `supplier_name`,
    ADD COLUMN `buyerId` VARCHAR(191) NULL,
    ADD COLUMN `date_sold` DATETIME(3) NULL,
    ADD COLUMN `sales_status` ENUM('SOLD', 'SWAP', 'NOT_SOLD') NOT NULL DEFAULT 'NOT_SOLD',
    ADD COLUMN `serial_no` VARCHAR(191) NOT NULL,
    ADD COLUMN `supplierId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `supplier` DROP COLUMN `email`,
    DROP COLUMN `name`,
    DROP COLUMN `phoneNo`,
    ADD COLUMN `supplier_email` VARCHAR(191) NULL,
    ADD COLUMN `supplier_name` VARCHAR(191) NOT NULL,
    ADD COLUMN `supplier_phone_no` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Buyer_email_key` ON `Buyer`(`email`);

-- CreateIndex
CREATE UNIQUE INDEX `Products_serial_no_key` ON `Products`(`serial_no`);

-- CreateIndex
CREATE UNIQUE INDEX `Supplier_supplier_name_key` ON `Supplier`(`supplier_name`);

-- AddForeignKey
ALTER TABLE `Products` ADD CONSTRAINT `Products_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Products` ADD CONSTRAINT `Products_buyerId_fkey` FOREIGN KEY (`buyerId`) REFERENCES `Buyer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
