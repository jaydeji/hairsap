/*
  Warnings:

  - You are about to drop the column `marketerMarketerId` on the `Promo` table. All the data in the column will be lost.
  - Added the required column `marketerId` to the `Promo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Promo` DROP FOREIGN KEY `Promo_marketerMarketerId_fkey`;

-- AlterTable
ALTER TABLE `Promo` DROP COLUMN `marketerMarketerId`,
    ADD COLUMN `marketerId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Promo` ADD CONSTRAINT `Promo_marketerId_fkey` FOREIGN KEY (`marketerId`) REFERENCES `Marketer`(`marketerId`) ON DELETE RESTRICT ON UPDATE CASCADE;
