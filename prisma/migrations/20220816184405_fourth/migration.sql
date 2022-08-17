-- DropForeignKey
ALTER TABLE `Otp` DROP FOREIGN KEY `Otp_adminId_fkey`;

-- DropForeignKey
ALTER TABLE `Otp` DROP FOREIGN KEY `Otp_proId_fkey`;

-- DropForeignKey
ALTER TABLE `Otp` DROP FOREIGN KEY `Otp_userId_fkey`;

-- AlterTable
ALTER TABLE `Otp` MODIFY `userId` INTEGER NULL,
    MODIFY `adminId` INTEGER NULL,
    MODIFY `proId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Otp` ADD CONSTRAINT `Otp_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Otp` ADD CONSTRAINT `Otp_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin`(`adminId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Otp` ADD CONSTRAINT `Otp_proId_fkey` FOREIGN KEY (`proId`) REFERENCES `Pro`(`proId`) ON DELETE SET NULL ON UPDATE CASCADE;
