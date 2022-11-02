/*
  Warnings:

  - You are about to drop the column `photo` on the `Chat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Chat` DROP COLUMN `photo`,
    ADD COLUMN `photoUrl` VARCHAR(512) NULL;
