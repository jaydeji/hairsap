/*
  Warnings:

  - Added the required column `amount` to the `InvoiceFees` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `InvoiceFees` ADD COLUMN `amount` INTEGER NOT NULL;
