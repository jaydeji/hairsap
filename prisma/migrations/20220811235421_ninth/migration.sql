-- DropForeignKey
ALTER TABLE `Booking` DROP FOREIGN KEY `Booking_invoiceId_fkey`;

-- AlterTable
ALTER TABLE `Booking` MODIFY `invoiceId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`bookingId`) ON DELETE RESTRICT ON UPDATE CASCADE;
