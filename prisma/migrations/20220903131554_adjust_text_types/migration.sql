/*
  Warnings:

  - You are about to drop the column `text` on the `Chat` table. All the data in the column will be lost.
  - You are about to alter the column `email` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `Booking` MODIFY `address` TEXT NOT NULL,
    MODIFY `samplePhotoUrl` VARCHAR(512) NULL,
    MODIFY `review` TEXT NULL;

-- AlterTable
ALTER TABLE `Chat` DROP COLUMN `text`,
    MODIFY `message` TEXT NULL,
    MODIFY `photo` VARCHAR(512) NULL;

-- AlterTable
ALTER TABLE `Notification` MODIFY `body` TEXT NULL;

-- AlterTable
ALTER TABLE `Service` MODIFY `photoUrl` VARCHAR(512) NOT NULL;

-- AlterTable
ALTER TABLE `SubService` MODIFY `photoUrl` VARCHAR(512) NOT NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `email` VARCHAR(191) NOT NULL,
    MODIFY `address` TEXT NOT NULL,
    MODIFY `profilePhotoUrl` VARCHAR(512) NULL,
    MODIFY `workVideoUrl` VARCHAR(512) NULL;
