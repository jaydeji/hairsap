/*
  Warnings:

  - Made the column `email` on table `Admin` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Admin` MODIFY `email` VARCHAR(255) NOT NULL;
