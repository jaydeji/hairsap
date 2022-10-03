-- DropForeignKey
ALTER TABLE `InvoiceFees` DROP FOREIGN KEY `InvoiceFees_invoiceId_fkey`;

-- AddForeignKey
ALTER TABLE `InvoiceFees` ADD CONSTRAINT `InvoiceFees_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`invoiceId`) ON DELETE CASCADE ON UPDATE CASCADE;
