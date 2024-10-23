/*
  Warnings:

  - The primary key for the `swaps` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `_incomingProducts` DROP FOREIGN KEY `_incomingProducts_B_fkey`;

-- DropForeignKey
ALTER TABLE `_outgoingProducts` DROP FOREIGN KEY `_outgoingProducts_B_fkey`;

-- AlterTable
ALTER TABLE `_incomingProducts` MODIFY `B` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `_outgoingProducts` MODIFY `B` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Swaps` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `_outgoingProducts` ADD CONSTRAINT `_outgoingProducts_B_fkey` FOREIGN KEY (`B`) REFERENCES `Swaps`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_incomingProducts` ADD CONSTRAINT `_incomingProducts_B_fkey` FOREIGN KEY (`B`) REFERENCES `Swaps`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
