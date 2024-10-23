/*
  Warnings:

  - Made the column `transId` on table `company` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `company` MODIFY `transId` BIGINT NOT NULL;
