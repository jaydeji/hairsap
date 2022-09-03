/*
  Warnings:

  - You are about to drop the column `deactivatedReason` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `deactivationCount` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `deactivatedReason`,
    DROP COLUMN `deactivationCount`;

-- CreateTable
CREATE TABLE `Deactivation` (
    `deactivationId` INTEGER NOT NULL AUTO_INCREMENT,
    `reason` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `paid` BOOLEAN NOT NULL DEFAULT false,
    `proId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`deactivationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Deactivation` ADD CONSTRAINT `Deactivation_proId_fkey` FOREIGN KEY (`proId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;
