/*
  Warnings:

  - You are about to drop the column `proId` on the `InvoiceFees` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `InvoiceFees` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `InvoiceFees` DROP FOREIGN KEY `InvoiceFees_proId_fkey`;

-- DropForeignKey
ALTER TABLE `InvoiceFees` DROP FOREIGN KEY `InvoiceFees_userId_fkey`;

-- AlterTable
ALTER TABLE `InvoiceFees` DROP COLUMN `proId`,
    DROP COLUMN `userId`;
