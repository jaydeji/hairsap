/*
  Warnings:

  - You are about to drop the column `closingAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resumptionAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `closingAt`,
    DROP COLUMN `resumptionAt`;
