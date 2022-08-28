/*
  Warnings:

  - You are about to drop the `RedeemPayment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `RedeemPayment` DROP FOREIGN KEY `RedeemPayment_userId_fkey`;

-- DropTable
DROP TABLE `RedeemPayment`;
