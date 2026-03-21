import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Admin User
  const adminPasswordHash = await bcrypt.hash("admin123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@culinarium.de" },
    update: {},
    create: {
      email: "admin@culinarium.de",
      name: "Admin",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });
  console.log("Admin erstellt:", admin.email);

  // Demo Customer
  const customerPasswordHash = await bcrypt.hash("kunde123!", 12);
  await prisma.user.upsert({
    where: { email: "kunde@example.de" },
    update: {},
    create: {
      email: "kunde@example.de",
      name: "Max Mustermann",
      passwordHash: customerPasswordHash,
      role: "CUSTOMER",
      phone: "030 1234567",
      street: "Musterstraße",
      houseNumber: "42",
      postalCode: "12345",
      city: "Berlin",
    },
  });

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "vorspeisen" },
      update: {},
      create: { name: "Vorspeisen", slug: "vorspeisen", sortOrder: 1 },
    }),
    prisma.category.upsert({
      where: { slug: "hauptgerichte" },
      update: {},
      create: { name: "Hauptgerichte", slug: "hauptgerichte", sortOrder: 2 },
    }),
    prisma.category.upsert({
      where: { slug: "beilagen" },
      update: {},
      create: { name: "Beilagen", slug: "beilagen", sortOrder: 3 },
    }),
    prisma.category.upsert({
      where: { slug: "desserts" },
      update: {},
      create: { name: "Desserts", slug: "desserts", sortOrder: 4 },
    }),
    prisma.category.upsert({
      where: { slug: "getraenke" },
      update: {},
      create: { name: "Getränke", slug: "getraenke", sortOrder: 5 },
    }),
    prisma.category.upsert({
      where: { slug: "salate" },
      update: {},
      create: { name: "Salate", slug: "salate", sortOrder: 6 },
    }),
  ]);

  const [vorspeisen, hauptgerichte, beilagen, desserts, getraenke, salate] = categories;

  // Menu Items
  const menuItems = [
    { name: "Tomatensuppe", slug: "tomatensuppe", description: "Cremige Tomatensuppe mit frischem Basilikum und Croutons", price: 4.90, categoryId: vorspeisen.id, isVegetarian: true, isVegan: true, isGlutenFree: true },
    { name: "Bruschetta", slug: "bruschetta", description: "Geröstetes Ciabatta mit Tomaten, Knoblauch und Olivenöl", price: 5.50, categoryId: vorspeisen.id, isVegetarian: true },
    { name: "Wiener Schnitzel", slug: "wiener-schnitzel", description: "Paniertes Kalbsschnitzel mit Zitrone, dazu Kartoffelsalat", price: 12.90, categoryId: hauptgerichte.id },
    { name: "Hähnchen Curry", slug: "haehnchen-curry", description: "Zartes Hähnchenfleisch in aromatischer Currysauce mit Basmatireis", price: 11.50, categoryId: hauptgerichte.id, isGlutenFree: true },
    { name: "Spaghetti Bolognese", slug: "spaghetti-bolognese", description: "Klassische Pasta mit hausgemachter Fleischsauce", price: 9.90, categoryId: hauptgerichte.id },
    { name: "Gemüse-Curry", slug: "gemuese-curry", description: "Saisonales Gemüse in cremiger Kokosnuss-Currysauce mit Reis", price: 10.50, categoryId: hauptgerichte.id, isVegetarian: true, isVegan: true, isGlutenFree: true },
    { name: "Lachs vom Grill", slug: "lachs-vom-grill", description: "Gegrilltes Lachsfilet mit Dillsauce und Gemüse der Saison", price: 14.90, categoryId: hauptgerichte.id, isGlutenFree: true },
    { name: "Kartoffelpüree", slug: "kartoffelpueree", description: "Cremiges Kartoffelpüree mit Butter und Muskatnuss", price: 3.50, categoryId: beilagen.id, isVegetarian: true, isGlutenFree: true },
    { name: "Gemischter Salat", slug: "gemischter-salat", description: "Frischer Blattsalat mit Gurke, Tomate und Hausdressing", price: 4.50, categoryId: salate.id, isVegetarian: true, isVegan: true, isGlutenFree: true },
    { name: "Caesar Salad", slug: "caesar-salad", description: "Römersalat mit Parmesan, Croutons und Caesar-Dressing", price: 8.90, categoryId: salate.id, isVegetarian: true },
    { name: "Tiramisu", slug: "tiramisu", description: "Klassisches italienisches Tiramisu mit Mascarpone und Espresso", price: 5.50, categoryId: desserts.id, isVegetarian: true },
    { name: "Panna Cotta", slug: "panna-cotta", description: "Sahnepudding mit Beerensoße", price: 4.90, categoryId: desserts.id, isVegetarian: true, isGlutenFree: true },
    { name: "Apfelstrudel", slug: "apfelstrudel", description: "Warmer Apfelstrudel mit Vanillesauce", price: 5.90, categoryId: desserts.id, isVegetarian: true },
    { name: "Mineralwasser", slug: "mineralwasser", description: "Stilles oder sprudelndes Mineralwasser 0,5l", price: 2.50, categoryId: getraenke.id, isVegetarian: true, isVegan: true, isGlutenFree: true },
    { name: "Apfelschorle", slug: "apfelschorle", description: "Erfrischende Apfelsaftschorle 0,5l", price: 3.00, categoryId: getraenke.id, isVegetarian: true, isVegan: true, isGlutenFree: true },
    { name: "Kaffee", slug: "kaffee", description: "Frisch gebrühter Filterkaffee", price: 2.50, categoryId: getraenke.id, isVegetarian: true, isVegan: true, isGlutenFree: true },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { slug: item.slug },
      update: {},
      create: item,
    });
  }

  // Site Settings
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      businessName: "Culinarium am Biesenhorst",
      tagline: "Frisch, regional und mit Liebe zubereitet",
      phone: "030 1234567",
      email: "info@culinarium-biesenhorst.de",
      street: "Biesenhorster Weg",
      houseNumber: "1",
      postalCode: "12683",
      city: "Berlin",
      instagramUrl: "https://www.instagram.com/culinariumambiesenhorst",
      facebookUrl: "https://www.facebook.com/Culinariumambiesenhorst",
      minimumOrderAmount: 10.0,
      deliveryFee: 3.50,
    },
  });

  // Business Hours (Mo-Fr 8-16, Sa-So geschlossen)
  const hours = [
    { dayOfWeek: 0, openTime: "08:00", closeTime: "16:00", isOpen: true },
    { dayOfWeek: 1, openTime: "08:00", closeTime: "16:00", isOpen: true },
    { dayOfWeek: 2, openTime: "08:00", closeTime: "16:00", isOpen: true },
    { dayOfWeek: 3, openTime: "08:00", closeTime: "16:00", isOpen: true },
    { dayOfWeek: 4, openTime: "08:00", closeTime: "16:00", isOpen: true },
    { dayOfWeek: 5, openTime: null, closeTime: null, isOpen: false },
    { dayOfWeek: 6, openTime: null, closeTime: null, isOpen: false },
  ];

  for (const h of hours) {
    await prisma.businessHours.upsert({
      where: { dayOfWeek: h.dayOfWeek },
      update: {},
      create: h,
    });
  }

  // Demo Reviews
  const customer = await prisma.user.findUnique({ where: { email: "kunde@example.de" } });
  if (customer) {
    const existingReviews = await prisma.review.count({ where: { userId: customer.id } });
    if (existingReviews === 0) {
      await prisma.review.createMany({
        data: [
          { userId: customer.id, rating: 5, title: "Ausgezeichnet!", comment: "Das beste Mittagessen in der Gegend. Frisch, lecker und preiswert. Das Wiener Schnitzel ist ein Traum!" },
          { userId: customer.id, rating: 4, title: "Sehr gut", comment: "Schnelle Lieferung, freundliches Personal. Die Tomatensuppe war hervorragend, nur die Portion hätte etwas größer sein können." },
        ],
      });
    }
  }

  console.log("Seed-Daten erfolgreich erstellt!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
