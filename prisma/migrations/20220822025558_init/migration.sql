-- AlterTable
ALTER TABLE `PaymentEvents` ADD COLUMN `email` VARCHAR(191) NULL,
    MODIFY `event` VARCHAR(191) NULL,
    MODIFY `reason` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `PaymentEvents_email_idx` ON `PaymentEvents`(`email`);
