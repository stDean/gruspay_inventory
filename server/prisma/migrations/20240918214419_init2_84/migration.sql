/*
  Warnings:

  - You are about to drop the column `amountPaid` on the `buyer` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `buyer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[buyer_name]` on the table `Buyer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[buyer_email]` on the table `Buyer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `amount_paid` to the `Buyer` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Buyer_email_key` ON `Buyer`;

-- AlterTable
ALTER TABLE `Buyer` DROP COLUMN `amountPaid`,
    DROP COLUMN `email`,
    ADD COLUMN `amount_paid` VARCHAR(191) NOT NULL,
    ADD COLUMN `buyer_email` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Buyer_buyer_name_key` ON `Buyer`(`buyer_name`);

-- CreateIndex
CREATE UNIQUE INDEX `Buyer_buyer_email_key` ON `Buyer`(`buyer_email`);
