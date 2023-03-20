/*
  Warnings:

  - You are about to drop the column `pinRedisKey` on the `Booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Booking` DROP COLUMN `pinRedisKey`,
    ADD COLUMN `pinRedisProKey` VARCHAR(191) NULL,
    ADD COLUMN `pinRedisUserKey` VARCHAR(191) NULL;
