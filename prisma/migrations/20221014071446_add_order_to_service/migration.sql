/*
  Warnings:

  - You are about to alter the column `order` on the `SubService` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `SubService` MODIFY `order` DOUBLE NOT NULL;
