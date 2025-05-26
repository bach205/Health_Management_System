/*
  Warnings:

  - You are about to drop the column `address` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `date_of_birth` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `full_name` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `patients` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `patients` DROP COLUMN `address`,
    DROP COLUMN `date_of_birth`,
    DROP COLUMN `full_name`,
    DROP COLUMN `gender`,
    DROP COLUMN `phone`;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `address` VARCHAR(191) NULL,
    ADD COLUMN `date_of_birth` DATETIME(3) NULL,
    ADD COLUMN `gender` ENUM('male', 'female', 'other') NULL;
