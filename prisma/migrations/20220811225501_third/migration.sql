/*
  Warnings:

  - You are about to drop the column `location` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `locationPhotoUrl` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `address` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Booking` DROP COLUMN `location`,
    DROP COLUMN `locationPhotoUrl`,
    ADD COLUMN `address` VARCHAR(191) NOT NULL,
    ADD COLUMN `samplePhotoUrl` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `User_latitude_longitude_idx` ON `User`(`latitude`, `longitude`);
