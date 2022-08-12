/*
  Warnings:

  - A unique constraint covering the columns `[invoiceId]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `invoiceId` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Invoice` DROP FOREIGN KEY `Invoice_bookingId_fkey`;

-- AlterTable
ALTER TABLE `Booking` ADD COLUMN `invoiceId` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Booking_invoiceId_key` ON `Booking`(`invoiceId`);

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`bookingId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `Booking` RENAME INDEX `Booking_proId_fkey` TO `Booking_proId_idx`;

-- RenameIndex
ALTER TABLE `Booking` RENAME INDEX `Booking_userId_fkey` TO `Booking_userId_idx`;
