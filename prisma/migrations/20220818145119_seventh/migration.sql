/*
  Warnings:

  - Made the column `messageType` on table `Chat` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Chat` MODIFY `message` VARCHAR(191) NULL,
    MODIFY `messageType` VARCHAR(191) NOT NULL;
