/*
  Warnings:

  - Added the required column `order` to the `SubService` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `SubService` ADD COLUMN `order` INTEGER NOT NULL;
