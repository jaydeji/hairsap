-- AlterTable
ALTER TABLE `User` ADD COLUMN `tempProfilePhotoKey` VARCHAR(191) NULL,
    ADD COLUMN `tempProfilePhotoOriginalFileName` VARCHAR(191) NULL,
    ADD COLUMN `tempProfilePhotoUrl` VARCHAR(512) NULL;
