-- Add email_verified field to users table
ALTER TABLE `users` 
ADD COLUMN `email_verified` BOOLEAN DEFAULT FALSE AFTER `email`;

-- Create email_otps table for storing OTP codes
CREATE TABLE IF NOT EXISTS `email_otps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(191) NOT NULL,
  `otp_code` varchar(6) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email_otp` (`email`, `otp_code`),
  KEY `idx_expires_at` (`expires_at`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

