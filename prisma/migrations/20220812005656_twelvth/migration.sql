/*
  Warnings:

  - You are about to drop the column `amount` on the `InvoiceFees` table. All the data in the column will be lost.
  - Added the required column `price` to the `InvoiceFees` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `InvoiceFees` DROP COLUMN `amount`,
    ADD COLUMN `price` INTEGER NOT NULL;
