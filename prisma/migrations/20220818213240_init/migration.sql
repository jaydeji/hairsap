/*
  Warnings:

  - A unique constraint covering the columns `[email,role]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone,role]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `User_email_role_key` ON `User`(`email`, `role`);

-- CreateIndex
CREATE UNIQUE INDEX `User_phone_role_key` ON `User`(`phone`, `role`);
