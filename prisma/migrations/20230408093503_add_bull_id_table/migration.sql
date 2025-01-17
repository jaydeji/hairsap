-- CreateTable
CREATE TABLE `BullIds` (
    `jobId` INTEGER NOT NULL,
    `otherId` INTEGER NOT NULL,
    `type` ENUM('PIN') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`jobId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
