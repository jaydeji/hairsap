/*
  Warnings:

  - You are about to drop the column `paid` on the `InvoiceFees` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Invoice` ADD COLUMN `paid` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `InvoiceFees` DROP COLUMN `paid`;
