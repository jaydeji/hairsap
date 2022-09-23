/*
  Warnings:

  - You are about to alter the column `amount` on the `Bonus` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `amount` on the `Deactivation` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `amountPaid` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `price` on the `InvoiceFees` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `price` on the `SubService` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `Bonus` MODIFY `amount` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `Deactivation` MODIFY `amount` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `Invoice` MODIFY `amountPaid` DOUBLE NULL;

-- AlterTable
ALTER TABLE `InvoiceFees` MODIFY `price` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `SubService` MODIFY `price` DOUBLE NOT NULL;
