-- AlterTable
ALTER TABLE `Company` ADD COLUMN `nextBillingDate` TIMESTAMP(6) NULL,
    ADD COLUMN `pendingPlanUpdate` VARCHAR(255) NULL,
    ADD COLUMN `scheduledDeactivation` TIMESTAMP(6) NULL;

-- CreateIndex
CREATE INDEX `Company_pendingPlanUpdate_idx` ON `Company`(`pendingPlanUpdate`);

-- CreateIndex
CREATE INDEX `Company_nextBillingDate_idx` ON `Company`(`nextBillingDate`);

-- CreateIndex
CREATE INDEX `Company_scheduledDeactivation_idx` ON `Company`(`scheduledDeactivation`);

-- CreateIndex
CREATE INDEX `Company_company_email_idx` ON `Company`(`company_email`);

-- CreateIndex
CREATE INDEX `Company_id_idx` ON `Company`(`id`);
