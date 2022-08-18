/*
  Warnings:

  - You are about to drop the column `livePhotoUrl` on the `Pro` table. All the data in the column will be lost.
  - You are about to drop the column `photoUrl` on the `Pro` table. All the data in the column will be lost.
  - You are about to drop the column `livePhotoUrl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `photoUrl` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Pro` DROP COLUMN `livePhotoUrl`,
    DROP COLUMN `photoUrl`,
    ADD COLUMN `faceIdPhotoOriginalFileName` VARCHAR(191) NULL,
    ADD COLUMN `faceIdPhotoPath` VARCHAR(191) NULL,
    ADD COLUMN `profilePhotoOriginalFileName` VARCHAR(191) NULL,
    ADD COLUMN `profilePhotoPath` VARCHAR(191) NULL,
    ADD COLUMN `profilePhotoUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `livePhotoUrl`,
    DROP COLUMN `photoUrl`,
    ADD COLUMN `faceIdPhotoOriginalFileName` VARCHAR(191) NULL,
    ADD COLUMN `faceIdPhotoPath` VARCHAR(191) NULL,
    ADD COLUMN `profilePhotoOriginalFileName` VARCHAR(191) NULL,
    ADD COLUMN `profilePhotoPath` VARCHAR(191) NULL,
    ADD COLUMN `profilePhotoUrl` VARCHAR(191) NULL;
