/*
  Warnings:

  - A unique constraint covering the columns `[supplier_phone_no,supplier_name,companyId]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Supplier_supplier_email_supplier_name_companyId_key` ON `Supplier`;

-- CreateIndex
CREATE UNIQUE INDEX `Supplier_supplier_phone_no_supplier_name_companyId_key` ON `Supplier`(`supplier_phone_no`, `supplier_name`, `companyId`);
