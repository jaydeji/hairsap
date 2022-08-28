-- AlterTable
ALTER TABLE `NotificationTracker` ADD COLUMN `userId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `NotificationTracker` ADD CONSTRAINT `NotificationTracker_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;
