/*
  Warnings:

  - A unique constraint covering the columns `[authorization_code,signature]` on the table `PayStackAuth` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `PayStackAuth_authorization_code_key` ON `paystackauth`;

-- DropIndex
DROP INDEX `PayStackAuth_signature_key` ON `paystackauth`;

-- CreateIndex
CREATE UNIQUE INDEX `PayStackAuth_authorization_code_signature_key` ON `PayStackAuth`(`authorization_code`, `signature`);
