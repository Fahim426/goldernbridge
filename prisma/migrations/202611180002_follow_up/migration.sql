-- AlterTable
ALTER TABLE `LeadActivity` ADD COLUMN `action` ENUM('STATUS', 'SCHEDULE', 'RESCHEDULE', 'COMPLETE', 'CONTACT', 'NOTE') NOT NULL DEFAULT 'STATUS',
    ADD COLUMN `details` TEXT NULL,
    MODIFY `previousStatus` ENUM('NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED') NULL,
    MODIFY `newStatus` ENUM('NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED') NULL;

-- CreateTable
CREATE TABLE `FollowUp` (
    `leadId` CHAR(36) NOT NULL,
    `scheduledAt` DATETIME(3) NOT NULL,
    `hasTime` BOOLEAN NOT NULL,
    `completedAt` DATETIME(3) NULL,
    `notes` TEXT NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,

    INDEX `FollowUp_completedAt_scheduledAt_idx`(`completedAt`, `scheduledAt`),
    PRIMARY KEY (`leadId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FollowUp` ADD CONSTRAINT `FollowUp_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `Lead`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
