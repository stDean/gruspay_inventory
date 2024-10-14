/*
  Warnings:

  - A unique constraint covering the columns `[signature]` on the table `PayStackAuth` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `PayStackAuth_signature_key` ON `PayStackAuth`(`signature`);
