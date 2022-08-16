-- AlterTable
ALTER TABLE `Booking` ADD COLUMN `paid` BOOLEAN NOT NULL DEFAULT false;

-- RenameIndex
ALTER TABLE `Bonus` RENAME INDEX `Bonus_userId_fkey` TO `Bonus_userId_idx`;

-- RenameIndex
ALTER TABLE `BookingSubService` RENAME INDEX `BookingSubService_subServiceId_fkey` TO `BookingSubService_subServiceId_idx`;

-- RenameIndex
ALTER TABLE `Chat` RENAME INDEX `Chat_receiverId_fkey` TO `Chat_receiverId_idx`;

-- RenameIndex
ALTER TABLE `Chat` RENAME INDEX `Chat_senderId_fkey` TO `Chat_senderId_idx`;

-- RenameIndex
ALTER TABLE `Device` RENAME INDEX `Device_userId_fkey` TO `Device_userId_idx`;

-- RenameIndex
ALTER TABLE `InvoiceFees` RENAME INDEX `InvoiceFees_invoiceId_fkey` TO `InvoiceFees_invoiceId_idx`;

-- RenameIndex
ALTER TABLE `Notification` RENAME INDEX `Notification_userId_fkey` TO `Notification_userId_idx`;

-- RenameIndex
ALTER TABLE `PaymentEvents` RENAME INDEX `PaymentEvents_userId_fkey` TO `PaymentEvents_userId_idx`;

-- RenameIndex
ALTER TABLE `RedeemPayment` RENAME INDEX `RedeemPayment_userId_fkey` TO `RedeemPayment_userId_idx`;

-- RenameIndex
ALTER TABLE `SubService` RENAME INDEX `SubService_serviceId_fkey` TO `SubService_serviceId_idx`;
