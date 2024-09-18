/*
  Warnings:

  - A unique constraint covering the columns `[supplier_name]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Supplier_supplier_name_key` ON `Supplier`(`supplier_name`);
