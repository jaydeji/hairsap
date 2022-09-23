/*
  Warnings:

  - You are about to alter the column `transportFee` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `Invoice` MODIFY `transportFee` DOUBLE NOT NULL;
