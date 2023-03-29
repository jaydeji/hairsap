-- CreateTable
CREATE TABLE `BookingFrequency` (
    `userId` INTEGER NOT NULL,
    `proId` INTEGER NOT NULL,
    `count` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `BookingFrequency_userId_proId_key`(`userId`, `proId`),
    PRIMARY KEY (`userId`, `proId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BookingFrequency` ADD CONSTRAINT `BookingFrequency_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookingFrequency` ADD CONSTRAINT `BookingFrequency_proId_fkey` FOREIGN KEY (`proId`) REFERENCES `User`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;
