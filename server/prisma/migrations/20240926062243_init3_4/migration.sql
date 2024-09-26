/*
  Warnings:

  - The primary key for the `swaps` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `_incomingproducts` DROP FOREIGN KEY `_incomingProducts_B_fkey`;

-- DropForeignKey
ALTER TABLE `_outgoingproducts` DROP FOREIGN KEY `_outgoingProducts_B_fkey`;

-- AlterTable
ALTER TABLE `_incomingproducts` MODIFY `B` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `_outgoingproducts` MODIFY `B` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `swaps` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `_outgoingProducts` ADD CONSTRAINT `_outgoingProducts_B_fkey` FOREIGN KEY (`B`) REFERENCES `Swaps`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_incomingProducts` ADD CONSTRAINT `_incomingProducts_B_fkey` FOREIGN KEY (`B`) REFERENCES `Swaps`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
