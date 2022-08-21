/*
  Warnings:

  - Made the column `proId` on table `InvoiceFees` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `InvoiceFees` DROP FOREIGN KEY `InvoiceFees_proId_fkey`;

-- AlterTable
ALTER TABLE `InvoiceFees` MODIFY `proId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `InvoiceFees` ADD CONSTRAINT `InvoiceFees_proId_fkey` FOREIGN KEY (`proId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;
