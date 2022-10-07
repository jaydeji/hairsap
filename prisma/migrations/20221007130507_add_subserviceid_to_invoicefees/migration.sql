/*
  Warnings:

  - Added the required column `subServiceId` to the `InvoiceFees` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `InvoiceFees` ADD COLUMN `subServiceId` INTEGER NOT NULL;
