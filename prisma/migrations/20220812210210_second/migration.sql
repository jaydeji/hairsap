/*
  Warnings:

  - You are about to drop the column `cancelled` on the `Booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Booking` DROP COLUMN `cancelled`,
    ADD COLUMN `cancelledAt` DATETIME(3) NULL;
