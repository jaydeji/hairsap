/*
  Warnings:

  - Added the required column `token` to the `PasswordReset` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `PasswordReset` ADD COLUMN `token` VARCHAR(191) NOT NULL;
