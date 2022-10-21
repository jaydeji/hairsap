-- DropForeignKey
ALTER TABLE `Promo` DROP FOREIGN KEY `Promo_discountId_fkey`;

-- DropForeignKey
ALTER TABLE `Promo` DROP FOREIGN KEY `Promo_marketerId_fkey`;

-- AlterTable
ALTER TABLE `Booking` ADD COLUMN `promoId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_promoId_fkey` FOREIGN KEY (`promoId`) REFERENCES `Promo`(`promoId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Promo` ADD CONSTRAINT `Promo_marketerId_fkey` FOREIGN KEY (`marketerId`) REFERENCES `Marketer`(`marketerId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Promo` ADD CONSTRAINT `Promo_discountId_fkey` FOREIGN KEY (`discountId`) REFERENCES `Discount`(`discountId`) ON DELETE CASCADE ON UPDATE CASCADE;
