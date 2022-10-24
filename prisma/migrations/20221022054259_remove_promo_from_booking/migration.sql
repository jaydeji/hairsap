/*
  Warnings:

  - You are about to drop the column `promoId` on the `Booking` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Booking` DROP FOREIGN KEY `Booking_promoId_fkey`;

-- AlterTable
ALTER TABLE `Booking` DROP COLUMN `promoId`,
    ADD COLUMN `promoPromoId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_promoPromoId_fkey` FOREIGN KEY (`promoPromoId`) REFERENCES `Promo`(`promoId`) ON DELETE SET NULL ON UPDATE CASCADE;
