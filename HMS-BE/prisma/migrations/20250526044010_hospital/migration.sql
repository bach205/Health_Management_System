-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('doctor', 'nurse', 'receptionist', 'admin', 'patient') NOT NULL;
