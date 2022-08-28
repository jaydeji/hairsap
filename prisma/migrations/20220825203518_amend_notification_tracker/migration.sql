/*
  Warnings:

  - You are about to drop the column `userId` on the `Bonus` table. All the data in the column will be lost.
  - Added the required column `proId` to the `Bonus` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Bonus` DROP FOREIGN KEY `Bonus_userId_fkey`;

-- AlterTable
ALTER TABLE `Bonus` DROP COLUMN `userId`,
    ADD COLUMN `proId` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `Bonus_proId_idx` ON `Bonus`(`proId`);

-- AddForeignKey
ALTER TABLE `Bonus` ADD CONSTRAINT `Bonus_proId_fkey` FOREIGN KEY (`proId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;
