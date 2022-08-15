-- AlterTable

ALTER TABLE
    `User` MODIFY `deactivationCount` INTEGER NOT NULL DEFAULT 0,
    MODIFY `reactivationCount` INTEGER NOT NULL DEFAULT 0;