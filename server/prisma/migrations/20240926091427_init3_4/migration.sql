/*
  Warnings:

  - You are about to drop the `_incomingproducts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_outgoingproducts` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[id]` on the table `Swaps` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `_incomingproducts` DROP FOREIGN KEY `_incomingProducts_A_fkey`;

-- DropForeignKey
ALTER TABLE `_incomingproducts` DROP FOREIGN KEY `_incomingProducts_B_fkey`;

-- DropForeignKey
ALTER TABLE `_outgoingproducts` DROP FOREIGN KEY `_outgoingProducts_A_fkey`;

-- DropForeignKey
ALTER TABLE `_outgoingproducts` DROP FOREIGN KEY `_outgoingProducts_B_fkey`;

-- AlterTable
ALTER TABLE `products` ADD COLUMN `swapsId` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `_incomingproducts`;

-- DropTable
DROP TABLE `_outgoingproducts`;

-- CreateIndex
CREATE UNIQUE INDEX `Swaps_id_key` ON `Swaps`(`id`);

-- AddForeignKey
ALTER TABLE `Products` ADD CONSTRAINT `Products_swapsId_fkey` FOREIGN KEY (`swapsId`) REFERENCES `Swaps`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
