/*
  Warnings:

  - Added the required column `available` to the `Available` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Available` ADD COLUMN `available` BOOLEAN NOT NULL;
