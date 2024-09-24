/*
  Warnings:

  - A unique constraint covering the columns `[serial_no,companyId]` on the table `Products` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Products_serial_no_key` ON `products`;

-- CreateIndex
CREATE UNIQUE INDEX `Products_serial_no_companyId_key` ON `Products`(`serial_no`, `companyId`);
