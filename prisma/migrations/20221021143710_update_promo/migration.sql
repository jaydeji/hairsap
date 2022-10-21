/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Promo` will be added. If there are existing duplicate values, this will fail.
  - Made the column `code` on table `Promo` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Promo` MODIFY `code` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Promo_code_key` ON `Promo`(`code`);

-- CreateIndex
CREATE INDEX `Promo_code_idx` ON `Promo`(`code`);
