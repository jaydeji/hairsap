/*
  Warnings:

  - A unique constraint covering the columns `[userId,token]` on the table `PasswordReset` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `PasswordReset_userId_token_key` ON `PasswordReset`(`userId`, `token`);

-- RenameIndex
ALTER TABLE `PasswordReset` RENAME INDEX `PasswordReset_userId_fkey` TO `PasswordReset_userId_idx`;
