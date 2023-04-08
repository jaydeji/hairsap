/*
  Warnings:

  - The primary key for the `BullIds` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `BullIds` DROP PRIMARY KEY,
    MODIFY `jobId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`jobId`);
