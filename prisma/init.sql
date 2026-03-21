-- Culinarium am Biesenhorst - Database Schema
-- Run this in phpMyAdmin on Hostinger

CREATE TABLE IF NOT EXISTS `User` (
  `id` VARCHAR(30) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `emailVerified` DATETIME(3) NULL,
  `passwordHash` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(191) NULL,
  `street` VARCHAR(191) NULL,
  `houseNumber` VARCHAR(191) NULL,
  `postalCode` VARCHAR(191) NULL,
  `city` VARCHAR(191) NULL,
  `role` VARCHAR(191) NOT NULL DEFAULT 'CUSTOMER',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `User_email_key`(`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Account` (
  `id` VARCHAR(30) NOT NULL,
  `userId` VARCHAR(30) NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `provider` VARCHAR(191) NOT NULL,
  `providerAccountId` VARCHAR(191) NOT NULL,
  `refresh_token` TEXT NULL,
  `access_token` TEXT NULL,
  `expires_at` INT NULL,
  `token_type` VARCHAR(191) NULL,
  `scope` VARCHAR(191) NULL,
  `id_token` TEXT NULL,
  `session_state` VARCHAR(191) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
  INDEX `Account_userId_idx`(`userId`),
  CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Session` (
  `id` VARCHAR(30) NOT NULL,
  `sessionToken` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(30) NOT NULL,
  `expires` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Session_sessionToken_key`(`sessionToken`),
  INDEX `Session_userId_idx`(`userId`),
  CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `VerificationToken` (
  `identifier` VARCHAR(191) NOT NULL,
  `token` VARCHAR(191) NOT NULL,
  `expires` DATETIME(3) NOT NULL,
  UNIQUE INDEX `VerificationToken_token_key`(`token`),
  UNIQUE INDEX `VerificationToken_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Category` (
  `id` VARCHAR(30) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `sortOrder` INT NOT NULL DEFAULT 0,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Category_name_key`(`name`),
  UNIQUE INDEX `Category_slug_key`(`slug`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `MenuItem` (
  `id` VARCHAR(30) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `description` TEXT NOT NULL,
  `price` DOUBLE NOT NULL,
  `imageUrl` VARCHAR(191) NULL,
  `categoryId` VARCHAR(30) NOT NULL,
  `isAvailable` BOOLEAN NOT NULL DEFAULT true,
  `isVegetarian` BOOLEAN NOT NULL DEFAULT false,
  `isVegan` BOOLEAN NOT NULL DEFAULT false,
  `isGlutenFree` BOOLEAN NOT NULL DEFAULT false,
  `allergens` VARCHAR(191) NULL,
  `sortOrder` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `MenuItem_slug_key`(`slug`),
  INDEX `MenuItem_categoryId_idx`(`categoryId`),
  CONSTRAINT `MenuItem_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `DailySpecial` (
  `id` VARCHAR(30) NOT NULL,
  `menuItemId` VARCHAR(30) NOT NULL,
  `date` DATE NOT NULL,
  `specialPrice` DOUBLE NULL,
  `note` TEXT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `DailySpecial_menuItemId_date_key`(`menuItemId`, `date`),
  INDEX `DailySpecial_menuItemId_idx`(`menuItemId`),
  CONSTRAINT `DailySpecial_menuItemId_fkey` FOREIGN KEY (`menuItemId`) REFERENCES `MenuItem`(`id`) ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `WeeklyPlanItem` (
  `id` VARCHAR(30) NOT NULL,
  `menuItemId` VARCHAR(30) NOT NULL,
  `dayOfWeek` INT NOT NULL,
  `weekStart` DATE NOT NULL,
  `mealType` VARCHAR(191) NOT NULL DEFAULT 'LUNCH',
  `note` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `WeeklyPlanItem_menuItemId_dayOfWeek_weekStart_mealType_key`(`menuItemId`, `dayOfWeek`, `weekStart`, `mealType`),
  INDEX `WeeklyPlanItem_menuItemId_idx`(`menuItemId`),
  CONSTRAINT `WeeklyPlanItem_menuItemId_fkey` FOREIGN KEY (`menuItemId`) REFERENCES `MenuItem`(`id`) ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Order` (
  `id` VARCHAR(30) NOT NULL,
  `orderNumber` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(30) NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
  `orderType` VARCHAR(191) NOT NULL DEFAULT 'PICKUP',
  `subtotal` DOUBLE NOT NULL,
  `deliveryFee` DOUBLE NOT NULL DEFAULT 0,
  `total` DOUBLE NOT NULL,
  `notes` TEXT NULL,
  `deliveryStreet` VARCHAR(191) NULL,
  `deliveryHouseNumber` VARCHAR(191) NULL,
  `deliveryPostalCode` VARCHAR(191) NULL,
  `deliveryCity` VARCHAR(191) NULL,
  `requestedTime` DATETIME(3) NULL,
  `customerName` VARCHAR(191) NOT NULL,
  `customerPhone` VARCHAR(191) NULL,
  `customerEmail` VARCHAR(191) NOT NULL,
  `telegramNotified` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Order_orderNumber_key`(`orderNumber`),
  INDEX `Order_userId_idx`(`userId`),
  CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `OrderItem` (
  `id` VARCHAR(30) NOT NULL,
  `orderId` VARCHAR(30) NOT NULL,
  `menuItemId` VARCHAR(30) NOT NULL,
  `quantity` INT NOT NULL,
  `unitPrice` DOUBLE NOT NULL,
  `itemName` VARCHAR(191) NOT NULL,
  `notes` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `OrderItem_orderId_idx`(`orderId`),
  INDEX `OrderItem_menuItemId_idx`(`menuItemId`),
  CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `OrderItem_menuItemId_fkey` FOREIGN KEY (`menuItemId`) REFERENCES `MenuItem`(`id`) ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Review` (
  `id` VARCHAR(30) NOT NULL,
  `userId` VARCHAR(30) NOT NULL,
  `rating` INT NOT NULL,
  `title` VARCHAR(191) NULL,
  `comment` TEXT NOT NULL,
  `isVisible` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `Review_userId_idx`(`userId`),
  CONSTRAINT `Review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `SiteSettings` (
  `id` VARCHAR(191) NOT NULL DEFAULT 'singleton',
  `businessName` VARCHAR(191) NOT NULL DEFAULT 'Culinarium am Biesenhorst',
  `tagline` VARCHAR(191) NULL,
  `phone` VARCHAR(191) NULL,
  `email` VARCHAR(191) NULL,
  `street` VARCHAR(191) NULL,
  `houseNumber` VARCHAR(191) NULL,
  `postalCode` VARCHAR(191) NULL,
  `city` VARCHAR(191) NULL,
  `instagramUrl` VARCHAR(191) NULL,
  `facebookUrl` VARCHAR(191) NULL,
  `telegramChatId` VARCHAR(191) NULL,
  `minimumOrderAmount` DOUBLE NOT NULL DEFAULT 10.0,
  `deliveryFee` DOUBLE NOT NULL DEFAULT 3.50,
  `deliveryRadius` DOUBLE NULL,
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `BusinessHours` (
  `id` VARCHAR(30) NOT NULL,
  `dayOfWeek` INT NOT NULL,
  `openTime` VARCHAR(191) NULL,
  `closeTime` VARCHAR(191) NULL,
  `isOpen` BOOLEAN NOT NULL DEFAULT true,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `BusinessHours_dayOfWeek_key`(`dayOfWeek`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `SiteImage` (
  `id` VARCHAR(30) NOT NULL,
  `url` VARCHAR(191) NOT NULL,
  `altText` VARCHAR(191) NULL,
  `category` VARCHAR(191) NOT NULL,
  `sortOrder` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `AgentLog` (
  `id` VARCHAR(30) NOT NULL,
  `taskName` VARCHAR(191) NOT NULL,
  `status` VARCHAR(191) NOT NULL,
  `message` TEXT NULL,
  `details` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `SocialPost` (
  `id` VARCHAR(30) NOT NULL,
  `platform` VARCHAR(191) NOT NULL,
  `caption` TEXT NOT NULL,
  `hashtags` TEXT NULL,
  `imageUrl` VARCHAR(191) NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'DRAFT',
  `scheduledAt` DATETIME(3) NULL,
  `postedAt` DATETIME(3) NULL,
  `error` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Insert default site settings
INSERT IGNORE INTO `SiteSettings` (`id`, `businessName`, `updatedAt`)
VALUES ('singleton', 'Culinarium am Biesenhorst', NOW());
