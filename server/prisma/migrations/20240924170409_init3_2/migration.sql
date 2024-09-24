/*
  Warnings:

  - A unique constraint covering the columns `[buyer_email,buyer_name,companyId]` on the table `Buyer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[supplier_email,supplier_name,companyId]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Buyer_buyer_email_buyer_name_key` ON `buyer`;

-- DropIndex
DROP INDEX `Supplier_supplier_email_supplier_name_key` ON `supplier`;

-- CreateIndex
CREATE UNIQUE INDEX `Buyer_buyer_email_buyer_name_companyId_key` ON `Buyer`(`buyer_email`, `buyer_name`, `companyId`);

-- CreateIndex
CREATE UNIQUE INDEX `Supplier_supplier_email_supplier_name_companyId_key` ON `Supplier`(`supplier_email`, `supplier_name`, `companyId`);
