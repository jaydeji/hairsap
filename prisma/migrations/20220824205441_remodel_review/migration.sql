/*
  Warnings:

  - You are about to drop the `Review` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Review` DROP FOREIGN KEY `Review_proId_fkey`;

-- DropForeignKey
ALTER TABLE `Review` DROP FOREIGN KEY `Review_userId_fkey`;

-- AlterTable
ALTER TABLE `Booking` ADD COLUMN `review` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `Review`;
