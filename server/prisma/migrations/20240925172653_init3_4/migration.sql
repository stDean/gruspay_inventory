/*
  Warnings:

  - You are about to drop the column `swapInId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `swapOutId` on the `products` table. All the data in the column will be lost.
  - The primary key for the `swaps` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `swaps` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `swaps` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `Products_swapInId_fkey`;

-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `Products_swapOutId_fkey`;

-- AlterTable
ALTER TABLE `products` DROP COLUMN `swapInId`,
    DROP COLUMN `swapOutId`;

-- AlterTable
ALTER TABLE `swaps` DROP PRIMARY KEY,
    DROP COLUMN `createdAt`,
    ADD COLUMN `swapDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- CreateTable
CREATE TABLE `_outgoingProducts` (
    `A` VARCHAR(191) NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_outgoingProducts_AB_unique`(`A`, `B`),
    INDEX `_outgoingProducts_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_incomingProducts` (
    `A` VARCHAR(191) NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_incomingProducts_AB_unique`(`A`, `B`),
    INDEX `_incomingProducts_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_outgoingProducts` ADD CONSTRAINT `_outgoingProducts_A_fkey` FOREIGN KEY (`A`) REFERENCES `Products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_outgoingProducts` ADD CONSTRAINT `_outgoingProducts_B_fkey` FOREIGN KEY (`B`) REFERENCES `Swaps`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_incomingProducts` ADD CONSTRAINT `_incomingProducts_A_fkey` FOREIGN KEY (`A`) REFERENCES `Products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_incomingProducts` ADD CONSTRAINT `_incomingProducts_B_fkey` FOREIGN KEY (`B`) REFERENCES `Swaps`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
