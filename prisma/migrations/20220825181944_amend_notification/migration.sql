-- AlterTable
ALTER TABLE `Notification` ADD COLUMN `title` VARCHAR(191) NULL,
    MODIFY `message` VARCHAR(191) NULL;
