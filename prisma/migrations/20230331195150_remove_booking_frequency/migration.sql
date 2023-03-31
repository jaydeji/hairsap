/*
  Warnings:

  - You are about to drop the column `pinRedisProKey` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `pinRedisUserKey` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the `BookingFrequency` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `BookingFrequency` DROP FOREIGN KEY `BookingFrequency_proId_fkey`;

-- DropForeignKey
ALTER TABLE `BookingFrequency` DROP FOREIGN KEY `BookingFrequency_userId_fkey`;

-- AlterTable
ALTER TABLE `Booking` DROP COLUMN `pinRedisProKey`,
    DROP COLUMN `pinRedisUserKey`;

-- DropTable
DROP TABLE `BookingFrequency`;
