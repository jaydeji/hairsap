/*
  Warnings:

  - You are about to drop the column `promoPromoId` on the `Booking` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Booking` DROP FOREIGN KEY `Booking_promoPromoId_fkey`;

-- AlterTable
ALTER TABLE `Booking` DROP COLUMN `promoPromoId`;
