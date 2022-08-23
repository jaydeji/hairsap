/*
  Warnings:

  - Added the required column `expiryMonth` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiryYear` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Made the column `authorization` on table `Card` required. This step will fail if there are existing NULL values in that column.
  - Made the column `authorizationCode` on table `Card` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bank` on table `Card` required. This step will fail if there are existing NULL values in that column.
  - Made the column `last4` on table `Card` required. This step will fail if there are existing NULL values in that column.
  - Made the column `brand` on table `Card` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Card` ADD COLUMN `expiryMonth` VARCHAR(191) NOT NULL,
    ADD COLUMN `expiryYear` VARCHAR(191) NOT NULL,
    MODIFY `authorization` JSON NOT NULL,
    MODIFY `authorizationCode` VARCHAR(191) NOT NULL,
    MODIFY `bank` VARCHAR(191) NOT NULL,
    MODIFY `last4` VARCHAR(191) NOT NULL,
    MODIFY `brand` VARCHAR(191) NOT NULL;
