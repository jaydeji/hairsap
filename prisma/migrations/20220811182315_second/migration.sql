/*
  Warnings:

  - You are about to drop the column `location` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `location`,
    ADD COLUMN `latitude` DECIMAL(10, 6) NULL,
    ADD COLUMN `longitude` DECIMAL(10, 6) NULL;
