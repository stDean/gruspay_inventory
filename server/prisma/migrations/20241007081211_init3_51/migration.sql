/*
  Warnings:

  - The values [BASIC,STANDARD,PREMIUM] on the enum `Company_payment_plan` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Company` MODIFY `payment_plan` ENUM('FREE', 'PERSONAL', 'TEAM', 'ENTERPRISE') NOT NULL DEFAULT 'FREE';
