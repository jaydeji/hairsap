/*
  Warnings:

  - You are about to alter the column `status` on the `Booking` table. The data in that column could be lost. The data in that column will be cast from `Enum("Booking_status")` to `VarChar(191)`.
  - You are about to alter the column `messageType` on the `Chat` table. The data in that column could be lost. The data in that column will be cast from `Enum("Chat_messageType")` to `VarChar(191)`.
  - You are about to alter the column `role` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Enum("User_role")` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `Booking` MODIFY `status` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Chat` MODIFY `messageType` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `role` VARCHAR(191) NOT NULL;
