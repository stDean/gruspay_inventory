/*
  Warnings:

  - A unique constraint covering the columns `[company_name]` on the table `Company` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Company_company_name_key` ON `Company`(`company_name`);
