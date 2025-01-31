-- CreateTable
CREATE TABLE `WebhookEvent` (
    `eventId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `WebhookEvent_eventId_key`(`eventId`),
    PRIMARY KEY (`eventId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
