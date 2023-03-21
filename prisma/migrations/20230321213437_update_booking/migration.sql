/*
  Warnings:

  - Made the column `pinAmount` on table `Booking` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Booking` MODIFY `pinAmount` INTEGER NOT NULL DEFAULT 0;
