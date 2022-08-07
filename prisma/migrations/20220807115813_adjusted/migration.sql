/*
  Warnings:

  - You are about to drop the column `Address` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `Address`,
    ADD COLUMN `address` VARCHAR(191) NULL,
    ADD COLUMN `approved` BOOLEAN NULL DEFAULT false,
    MODIFY `email` VARCHAR(255) NULL,
    MODIFY `phone` VARCHAR(191) NULL,
    MODIFY `photoUrl` VARCHAR(191) NULL,
    MODIFY `deviceInfo` VARCHAR(191) NULL,
    MODIFY `deactivated` BOOLEAN NULL DEFAULT false,
    MODIFY `deactivatedReason` INTEGER NULL,
    MODIFY `deactivationCount` INTEGER NULL,
    MODIFY `reactivationCount` INTEGER NULL,
    MODIFY `terminated` BOOLEAN NULL DEFAULT false,
    MODIFY `longitude` DECIMAL(65, 30) NULL,
    MODIFY `latitude` DECIMAL(65, 30) NULL,
    MODIFY `resumptionAt` DATETIME(3) NULL,
    MODIFY `closingAt` DATETIME(3) NULL,
    MODIFY `workVideoUrl` VARCHAR(191) NULL,
    MODIFY `businessName` VARCHAR(191) NULL;
