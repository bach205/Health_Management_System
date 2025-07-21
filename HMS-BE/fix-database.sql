-- Fix examination_orders table
ALTER TABLE `examination_orders` 
ADD COLUMN IF NOT EXISTS `appointment_id` INTEGER NOT NULL,
ADD COLUMN IF NOT EXISTS `reason` TEXT NULL,
ADD COLUMN IF NOT EXISTS `extra_cost` INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS `note` TEXT NULL;

-- Fix queues table
ALTER TABLE `queues` 
ADD COLUMN IF NOT EXISTS `slot_date` DATETIME(3) NULL; 