/*
  Warnings:

  - You are about to drop the column `paid` on the `Booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Booking` DROP COLUMN `paid`;

-- AlterTable
ALTER TABLE `InvoiceFees` ADD COLUMN `paid` BOOLEAN NOT NULL DEFAULT false;
