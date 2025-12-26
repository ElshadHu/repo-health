-- Remove unused tables
DROP TABLE IF EXISTS `Analysis`;
DROP TABLE IF EXISTS `Contributor`;
DROP TABLE IF EXISTS `VerificationToken`;

-- Add isPrivate column to SearchHistory
ALTER TABLE `SearchHistory` ADD COLUMN `isPrivate` BOOLEAN NOT NULL DEFAULT false;
