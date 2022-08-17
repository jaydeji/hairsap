-- DropForeignKey
ALTER TABLE `PasswordReset` DROP FOREIGN KEY `PasswordReset_adminId_fkey`;

-- DropForeignKey
ALTER TABLE `PasswordReset` DROP FOREIGN KEY `PasswordReset_proId_fkey`;

-- DropForeignKey
ALTER TABLE `PasswordReset` DROP FOREIGN KEY `PasswordReset_userId_fkey`;

-- AlterTable
ALTER TABLE `PasswordReset` MODIFY `userId` INTEGER NULL,
    MODIFY `proId` INTEGER NULL,
    MODIFY `adminId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Pro_email_idx` ON `Pro`(`email`);

-- AddForeignKey
ALTER TABLE `PasswordReset` ADD CONSTRAINT `PasswordReset_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PasswordReset` ADD CONSTRAINT `PasswordReset_proId_fkey` FOREIGN KEY (`proId`) REFERENCES `Pro`(`proId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PasswordReset` ADD CONSTRAINT `PasswordReset_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin`(`adminId`) ON DELETE SET NULL ON UPDATE CASCADE;
