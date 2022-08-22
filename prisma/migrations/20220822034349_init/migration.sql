-- CreateTable
CREATE TABLE `Card` (
    `cardId` INTEGER NOT NULL AUTO_INCREMENT,
    `authorization` JSON NULL,
    `authorizationCode` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Card_userId_key`(`userId`),
    PRIMARY KEY (`cardId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Card` ADD CONSTRAINT `Card_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;
