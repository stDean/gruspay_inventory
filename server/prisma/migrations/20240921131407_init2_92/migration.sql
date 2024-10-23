/*
  Warnings:

  - A unique constraint covering the columns `[buyer_email,buyer_name]` on the table `Buyer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[supplier_email,supplier_name]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Buyer_buyer_email_key` ON `Buyer`;

-- DropIndex
DROP INDEX `Buyer_buyer_name_key` ON `Buyer`;

-- DropIndex
DROP INDEX `Supplier_supplier_email_key` ON `Supplier`;

-- DropIndex
DROP INDEX `Supplier_supplier_name_key` ON `Supplier`;

-- CreateIndex
CREATE UNIQUE INDEX `Buyer_buyer_email_buyer_name_key` ON `Buyer`(`buyer_email`, `buyer_name`);

-- CreateIndex
CREATE UNIQUE INDEX `Supplier_supplier_email_supplier_name_key` ON `Supplier`(`supplier_email`, `supplier_name`);
