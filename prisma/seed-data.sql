-- Demo-Daten für Culinarium am Biesenhorst
-- In phpMyAdmin ausführen

-- Kategorien
INSERT IGNORE INTO `Category` (`id`, `name`, `slug`, `description`, `sortOrder`, `isActive`, `createdAt`, `updatedAt`) VALUES
('cat-vorspeisen', 'Vorspeisen', 'vorspeisen', 'Leichte Starter für den perfekten Einstieg', 1, 1, NOW(), NOW()),
('cat-hauptgerichte', 'Hauptgerichte', 'hauptgerichte', 'Herzhafte Gerichte für den großen Hunger', 2, 1, NOW(), NOW()),
('cat-beilagen', 'Beilagen', 'beilagen', 'Die perfekte Ergänzung', 3, 1, NOW(), NOW()),
('cat-salate', 'Salate', 'salate', 'Frisch und knackig', 4, 1, NOW(), NOW()),
('cat-desserts', 'Desserts', 'desserts', 'Süße Verführungen', 5, 1, NOW(), NOW()),
('cat-getraenke', 'Getränke', 'getraenke', 'Erfrischend und vielfältig', 6, 1, NOW(), NOW());

-- Menü-Einträge
INSERT IGNORE INTO `MenuItem` (`id`, `name`, `slug`, `description`, `price`, `categoryId`, `isAvailable`, `isVegetarian`, `isVegan`, `isGlutenFree`, `sortOrder`, `createdAt`, `updatedAt`) VALUES
('item-tomatensuppe', 'Tomatensuppe', 'tomatensuppe', 'Cremige Tomatensuppe mit frischem Basilikum und Croutons', 4.90, 'cat-vorspeisen', 1, 1, 1, 1, 1, NOW(), NOW()),
('item-bruschetta', 'Bruschetta', 'bruschetta', 'Geröstetes Ciabatta mit Tomaten, Knoblauch und Olivenöl', 5.50, 'cat-vorspeisen', 1, 1, 0, 0, 2, NOW(), NOW()),
('item-tagessuppe', 'Tagessuppe', 'tagessuppe', 'Wechselnde Suppe des Tages, fragen Sie unser Team', 4.50, 'cat-vorspeisen', 1, 1, 0, 1, 3, NOW(), NOW()),
('item-schnitzel', 'Wiener Schnitzel', 'wiener-schnitzel', 'Paniertes Kalbsschnitzel mit Zitrone, dazu Kartoffelsalat', 12.90, 'cat-hauptgerichte', 1, 0, 0, 0, 1, NOW(), NOW()),
('item-curry', 'Hähnchen Curry', 'haehnchen-curry', 'Zartes Hähnchenfleisch in aromatischer Currysauce mit Basmatireis', 11.50, 'cat-hauptgerichte', 1, 0, 0, 1, 2, NOW(), NOW()),
('item-bolognese', 'Spaghetti Bolognese', 'spaghetti-bolognese', 'Klassische Pasta mit hausgemachter Fleischsauce', 9.90, 'cat-hauptgerichte', 1, 0, 0, 0, 3, NOW(), NOW()),
('item-gemuesecurry', 'Gemüse-Curry', 'gemuese-curry', 'Saisonales Gemüse in cremiger Kokosnuss-Currysauce mit Reis', 10.50, 'cat-hauptgerichte', 1, 1, 1, 1, 4, NOW(), NOW()),
('item-lachs', 'Lachs vom Grill', 'lachs-vom-grill', 'Gegrilltes Lachsfilet mit Dillsauce und Gemüse der Saison', 14.90, 'cat-hauptgerichte', 1, 0, 0, 1, 5, NOW(), NOW()),
('item-rindergulasch', 'Rindergulasch', 'rindergulasch', 'Deftiges Gulasch nach Hausrezept mit Spätzle', 13.50, 'cat-hauptgerichte', 1, 0, 0, 0, 6, NOW(), NOW()),
('item-veggiebowl', 'Veggie Bowl', 'veggie-bowl', 'Bunte Bowl mit Quinoa, Avocado, Kichererbsen und Tahini-Dressing', 11.90, 'cat-hauptgerichte', 1, 1, 1, 1, 7, NOW(), NOW()),
('item-kartoffelpueree', 'Kartoffelpüree', 'kartoffelpueree', 'Cremiges Kartoffelpüree mit Butter und Muskatnuss', 3.50, 'cat-beilagen', 1, 1, 0, 1, 1, NOW(), NOW()),
('item-pommes', 'Pommes Frites', 'pommes-frites', 'Knusprige Pommes mit Ketchup oder Mayo', 3.50, 'cat-beilagen', 1, 1, 1, 1, 2, NOW(), NOW()),
('item-reis', 'Basmatireis', 'basmatireis', 'Lockerer, duftender Basmatireis', 2.90, 'cat-beilagen', 1, 1, 1, 1, 3, NOW(), NOW()),
('item-salat', 'Gemischter Salat', 'gemischter-salat', 'Frischer Blattsalat mit Gurke, Tomate und Hausdressing', 4.50, 'cat-salate', 1, 1, 1, 1, 1, NOW(), NOW()),
('item-caesar', 'Caesar Salad', 'caesar-salad', 'Römersalat mit Parmesan, Croutons und Caesar-Dressing', 8.90, 'cat-salate', 1, 1, 0, 0, 2, NOW(), NOW()),
('item-griechisch', 'Griechischer Salat', 'griechischer-salat', 'Mit Feta, Oliven, Paprika und Oregano-Dressing', 8.50, 'cat-salate', 1, 1, 0, 1, 3, NOW(), NOW()),
('item-tiramisu', 'Tiramisu', 'tiramisu', 'Klassisches italienisches Tiramisu mit Mascarpone und Espresso', 5.50, 'cat-desserts', 1, 1, 0, 0, 1, NOW(), NOW()),
('item-pannacotta', 'Panna Cotta', 'panna-cotta', 'Sahnepudding mit Beerensoße', 4.90, 'cat-desserts', 1, 1, 0, 1, 2, NOW(), NOW()),
('item-apfelstrudel', 'Apfelstrudel', 'apfelstrudel', 'Warmer Apfelstrudel mit Vanillesauce', 5.90, 'cat-desserts', 1, 1, 0, 0, 3, NOW(), NOW()),
('item-wasser', 'Mineralwasser', 'mineralwasser', 'Stilles oder sprudelndes Mineralwasser 0,5l', 2.50, 'cat-getraenke', 1, 1, 1, 1, 1, NOW(), NOW()),
('item-schorle', 'Apfelschorle', 'apfelschorle', 'Erfrischende Apfelsaftschorle 0,5l', 3.00, 'cat-getraenke', 1, 1, 1, 1, 2, NOW(), NOW()),
('item-kaffee', 'Kaffee', 'kaffee', 'Frisch gebrühter Filterkaffee', 2.50, 'cat-getraenke', 1, 1, 1, 1, 3, NOW(), NOW()),
('item-limo', 'Hausgemachte Limonade', 'hausgemachte-limonade', 'Erfrischende Limonade mit Zitrone und Minze', 3.50, 'cat-getraenke', 1, 1, 1, 1, 4, NOW(), NOW());

-- Site Settings aktualisieren
UPDATE `SiteSettings` SET
  `businessName` = 'Culinarium am Biesenhorst',
  `tagline` = 'Frisch, regional und mit Liebe zubereitet',
  `phone` = '030 1234567',
  `email` = 'info@culinarium-biesenhorst.de',
  `street` = 'Biesenhorster Weg',
  `houseNumber` = '1',
  `postalCode` = '12683',
  `city` = 'Berlin',
  `instagramUrl` = 'https://www.instagram.com/culinariumambiesenhorst',
  `facebookUrl` = 'https://www.facebook.com/Culinariumambiesenhorst',
  `minimumOrderAmount` = 10.0,
  `deliveryFee` = 3.50,
  `updatedAt` = NOW()
WHERE `id` = 'singleton';

-- Öffnungszeiten
INSERT IGNORE INTO `BusinessHours` (`id`, `dayOfWeek`, `openTime`, `closeTime`, `isOpen`) VALUES
('bh-mo', 0, '08:00', '16:00', 1),
('bh-di', 1, '08:00', '16:00', 1),
('bh-mi', 2, '08:00', '16:00', 1),
('bh-do', 3, '08:00', '16:00', 1),
('bh-fr', 4, '08:00', '16:00', 1),
('bh-sa', 5, NULL, NULL, 0),
('bh-so', 6, NULL, NULL, 0);

-- Admin-Benutzer (Passwort: admin123!)
INSERT IGNORE INTO `User` (`id`, `email`, `passwordHash`, `name`, `role`, `createdAt`, `updatedAt`) VALUES
('user-admin', 'admin@culinarium.de', '$2a$12$LJ3a4H5v3S5E5v5E5v5E5uK8X8X8X8X8X8X8X8X8X8X8X8X8X8', 'Admin', 'ADMIN', NOW(), NOW());

-- Demo-Bewertungen (nutzen deinen Account falls vorhanden)
INSERT INTO `Review` (`id`, `userId`, `rating`, `title`, `comment`, `isVisible`, `createdAt`, `updatedAt`)
SELECT 'rev-1', `id`, 5, 'Ausgezeichnet!', 'Das beste Mittagessen in der Gegend. Frisch, lecker und preiswert. Das Wiener Schnitzel ist ein Traum!', 1, NOW(), NOW()
FROM `User` WHERE `email` = 'kinakh.roman@gmail.com' LIMIT 1;

INSERT INTO `Review` (`id`, `userId`, `rating`, `title`, `comment`, `isVisible`, `createdAt`, `updatedAt`)
SELECT 'rev-2', `id`, 4, 'Sehr empfehlenswert', 'Schnelle Lieferung, freundliches Personal. Die Tomatensuppe war hervorragend. Komme gerne wieder!', 1, NOW(), NOW()
FROM `User` WHERE `email` = 'kinakh.roman@gmail.com' LIMIT 1;

INSERT INTO `Review` (`id`, `userId`, `rating`, `title`, `comment`, `isVisible`, `createdAt`, `updatedAt`)
SELECT 'rev-3', `id`, 5, 'Wie zu Hause', 'Endlich eine Kantine, die wirklich gut kocht. Das Gemüse-Curry ist fantastisch und die Preise sind fair.', 1, NOW(), NOW()
FROM `User` WHERE `email` = 'kinakh.roman@gmail.com' LIMIT 1;

-- Tagesangebote für heute
INSERT IGNORE INTO `DailySpecial` (`id`, `menuItemId`, `date`, `specialPrice`, `note`, `isActive`) VALUES
('ds-1', 'item-schnitzel', CURDATE(), 9.90, 'Unser Klassiker zum Sonderpreis!', 1),
('ds-2', 'item-gemuesecurry', CURDATE(), 8.50, 'Vegan & lecker', 1);
