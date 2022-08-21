-- AlterTable
ALTER TABLE `InvoiceFees` ADD COLUMN `proId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `InvoiceFees` ADD CONSTRAINT `InvoiceFees_proId_fkey` FOREIGN KEY (`proId`) REFERENCES `User`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;
