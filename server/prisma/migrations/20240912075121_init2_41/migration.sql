/*
  Warnings:

  - A unique constraint covering the columns `[serialNo]` on the table `Products` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Products_serialNo_key` ON `Products`(`serialNo`);
