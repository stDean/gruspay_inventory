/*
  Warnings:

  - You are about to drop the column `secretKey` on the `company` table. All the data in the column will be lost.
  - You are about to drop the column `secretKey` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `company` DROP COLUMN `secretKey`;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `secretKey`;
