-- AlterTable
ALTER TABLE `Invoice` ADD COLUMN `promoId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_promoId_fkey` FOREIGN KEY (`promoId`) REFERENCES `Promo`(`promoId`) ON DELETE SET NULL ON UPDATE CASCADE;
