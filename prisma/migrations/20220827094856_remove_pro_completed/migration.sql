/*
  Warnings:

  - You are about to drop the column `proCompleted` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `userCompleted` on the `Booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Booking` DROP COLUMN `proCompleted`,
    DROP COLUMN `userCompleted`;
