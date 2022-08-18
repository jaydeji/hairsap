/*
  Warnings:

  - You are about to drop the column `rejected` on the `User` table. All the data in the column will be lost.
  - Made the column `address` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `User_email_key` ON `User`;

-- DropIndex
DROP INDEX `User_phone_key` ON `User`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `rejected`,
    ADD COLUMN `available` BOOLEAN NULL DEFAULT true,
    MODIFY `address` VARCHAR(191) NOT NULL;
