/*
  Warnings:

  - You are about to alter the column `distance` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,6)` to `Double`.

*/
-- AlterTable
ALTER TABLE `Invoice` MODIFY `distance` DOUBLE NOT NULL;
