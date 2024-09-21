/*
  Warnings:

  - A unique constraint covering the columns `[buyer_name]` on the table `Buyer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[buyer_email]` on the table `Buyer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[supplier_name]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[supplier_email]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Buyer_buyer_name_key` ON `Buyer`(`buyer_name`);

-- CreateIndex
CREATE UNIQUE INDEX `Buyer_buyer_email_key` ON `Buyer`(`buyer_email`);

-- CreateIndex
CREATE UNIQUE INDEX `Supplier_supplier_name_key` ON `Supplier`(`supplier_name`);

-- CreateIndex
CREATE UNIQUE INDEX `Supplier_supplier_email_key` ON `Supplier`(`supplier_email`);
