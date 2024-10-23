/*
  Warnings:

  - A unique constraint covering the columns `[supplier_email]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Supplier_supplier_name_key` ON `Supplier`;

-- CreateIndex
CREATE UNIQUE INDEX `Supplier_supplier_email_key` ON `Supplier`(`supplier_email`);
