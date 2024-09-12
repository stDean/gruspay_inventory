/*
  Warnings:

  - You are about to drop the column `productsId` on the `sales` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[productId]` on the table `Sales` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `productId` to the `Sales` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `sales` DROP FOREIGN KEY `Sales_productsId_fkey`;

-- AlterTable
ALTER TABLE `sales` DROP COLUMN `productsId`,
    ADD COLUMN `productId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Sales_productId_key` ON `Sales`(`productId`);

-- AddForeignKey
ALTER TABLE `Sales` ADD CONSTRAINT `Sales_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
