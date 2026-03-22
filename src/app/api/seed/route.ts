import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Kategorien
    const categories = [
      { id: "cat-vorspeisen", name: "Vorspeisen", slug: "vorspeisen", description: "Leichte Starter für den perfekten Einstieg", sortOrder: 1 },
      { id: "cat-hauptgerichte", name: "Hauptgerichte", slug: "hauptgerichte", description: "Herzhafte Gerichte für den großen Hunger", sortOrder: 2 },
      { id: "cat-beilagen", name: "Beilagen", slug: "beilagen", description: "Die perfekte Ergänzung", sortOrder: 3 },
      { id: "cat-salate", name: "Salate", slug: "salate", description: "Frisch und knackig", sortOrder: 4 },
      { id: "cat-desserts", name: "Desserts", slug: "desserts", description: "Süße Verführungen", sortOrder: 5 },
      { id: "cat-getraenke", name: "Getränke", slug: "getraenke", description: "Erfrischend und vielfältig", sortOrder: 6 },
    ];

    for (const cat of categories) {
      const existing = await db.category.findUnique({ where: { slug: cat.slug } });
      if (!existing) {
        await db.category.create({ data: cat });
      }
    }

    // Menü-Einträge
    const menuItems = [
      { name: "Tomatensuppe", slug: "tomatensuppe", description: "Cremige Tomatensuppe mit frischem Basilikum und Croutons", price: 4.90, categoryId: "cat-vorspeisen", isVegetarian: true, isVegan: true, isGlutenFree: true, sortOrder: 1 },
      { name: "Bruschetta", slug: "bruschetta", description: "Geröstetes Ciabatta mit Tomaten, Knoblauch und Olivenöl", price: 5.50, categoryId: "cat-vorspeisen", isVegetarian: true, sortOrder: 2 },
      { name: "Tagessuppe", slug: "tagessuppe", description: "Wechselnde Suppe des Tages, fragen Sie unser Team", price: 4.50, categoryId: "cat-vorspeisen", isVegetarian: true, isGlutenFree: true, sortOrder: 3 },
      { name: "Wiener Schnitzel", slug: "wiener-schnitzel", description: "Paniertes Kalbsschnitzel mit Zitrone, dazu Kartoffelsalat", price: 12.90, categoryId: "cat-hauptgerichte", sortOrder: 1 },
      { name: "Hähnchen Curry", slug: "haehnchen-curry", description: "Zartes Hähnchenfleisch in aromatischer Currysauce mit Basmatireis", price: 11.50, categoryId: "cat-hauptgerichte", isGlutenFree: true, sortOrder: 2 },
      { name: "Spaghetti Bolognese", slug: "spaghetti-bolognese", description: "Klassische Pasta mit hausgemachter Fleischsauce", price: 9.90, categoryId: "cat-hauptgerichte", sortOrder: 3 },
      { name: "Gemüse-Curry", slug: "gemuese-curry", description: "Saisonales Gemüse in cremiger Kokosnuss-Currysauce mit Reis", price: 10.50, categoryId: "cat-hauptgerichte", isVegetarian: true, isVegan: true, isGlutenFree: true, sortOrder: 4 },
      { name: "Lachs vom Grill", slug: "lachs-vom-grill", description: "Gegrilltes Lachsfilet mit Dillsauce und Gemüse der Saison", price: 14.90, categoryId: "cat-hauptgerichte", isGlutenFree: true, sortOrder: 5 },
      { name: "Rindergulasch", slug: "rindergulasch", description: "Deftiges Gulasch nach Hausrezept mit Spätzle", price: 13.50, categoryId: "cat-hauptgerichte", sortOrder: 6 },
      { name: "Veggie Bowl", slug: "veggie-bowl", description: "Bunte Bowl mit Quinoa, Avocado, Kichererbsen und Tahini-Dressing", price: 11.90, categoryId: "cat-hauptgerichte", isVegetarian: true, isVegan: true, isGlutenFree: true, sortOrder: 7 },
      { name: "Kartoffelpüree", slug: "kartoffelpueree", description: "Cremiges Kartoffelpüree mit Butter und Muskatnuss", price: 3.50, categoryId: "cat-beilagen", isVegetarian: true, isGlutenFree: true, sortOrder: 1 },
      { name: "Pommes Frites", slug: "pommes-frites", description: "Knusprige Pommes mit Ketchup oder Mayo", price: 3.50, categoryId: "cat-beilagen", isVegetarian: true, isVegan: true, isGlutenFree: true, sortOrder: 2 },
      { name: "Basmatireis", slug: "basmatireis", description: "Lockerer, duftender Basmatireis", price: 2.90, categoryId: "cat-beilagen", isVegetarian: true, isVegan: true, isGlutenFree: true, sortOrder: 3 },
      { name: "Gemischter Salat", slug: "gemischter-salat", description: "Frischer Blattsalat mit Gurke, Tomate und Hausdressing", price: 4.50, categoryId: "cat-salate", isVegetarian: true, isVegan: true, isGlutenFree: true, sortOrder: 1 },
      { name: "Caesar Salad", slug: "caesar-salad", description: "Römersalat mit Parmesan, Croutons und Caesar-Dressing", price: 8.90, categoryId: "cat-salate", isVegetarian: true, sortOrder: 2 },
      { name: "Griechischer Salat", slug: "griechischer-salat", description: "Mit Feta, Oliven, Paprika und Oregano-Dressing", price: 8.50, categoryId: "cat-salate", isVegetarian: true, isGlutenFree: true, sortOrder: 3 },
      { name: "Tiramisu", slug: "tiramisu", description: "Klassisches italienisches Tiramisu mit Mascarpone und Espresso", price: 5.50, categoryId: "cat-desserts", isVegetarian: true, sortOrder: 1 },
      { name: "Panna Cotta", slug: "panna-cotta", description: "Sahnepudding mit Beerensoße", price: 4.90, categoryId: "cat-desserts", isVegetarian: true, isGlutenFree: true, sortOrder: 2 },
      { name: "Apfelstrudel", slug: "apfelstrudel", description: "Warmer Apfelstrudel mit Vanillesauce", price: 5.90, categoryId: "cat-desserts", isVegetarian: true, sortOrder: 3 },
      { name: "Mineralwasser", slug: "mineralwasser", description: "Stilles oder sprudelndes Mineralwasser 0,5l", price: 2.50, categoryId: "cat-getraenke", isVegetarian: true, isVegan: true, isGlutenFree: true, sortOrder: 1 },
      { name: "Apfelschorle", slug: "apfelschorle", description: "Erfrischende Apfelsaftschorle 0,5l", price: 3.00, categoryId: "cat-getraenke", isVegetarian: true, isVegan: true, isGlutenFree: true, sortOrder: 2 },
      { name: "Kaffee", slug: "kaffee", description: "Frisch gebrühter Filterkaffee", price: 2.50, categoryId: "cat-getraenke", isVegetarian: true, isVegan: true, isGlutenFree: true, sortOrder: 3 },
      { name: "Hausgemachte Limonade", slug: "hausgemachte-limonade", description: "Erfrischende Limonade mit Zitrone und Minze", price: 3.50, categoryId: "cat-getraenke", isVegetarian: true, isVegan: true, isGlutenFree: true, sortOrder: 4 },
    ];

    for (const item of menuItems) {
      const existing = await db.menuItem.findUnique({ where: { slug: item.slug } });
      if (!existing) {
        await db.menuItem.create({ data: item });
      }
    }

    // Bewertungen
    const users = await db.user.findMany({ take: 1 });
    if (users.length > 0) {
      const reviewCount = await db.review.count();
      if (reviewCount === 0) {
        await db.review.create({ data: { userId: users[0].id, rating: 5, title: "Ausgezeichnet!", comment: "Das beste Mittagessen in der Gegend. Frisch, lecker und preiswert. Das Wiener Schnitzel ist ein Traum!" } });
        await db.review.create({ data: { userId: users[0].id, rating: 4, title: "Sehr empfehlenswert", comment: "Schnelle Lieferung, freundliches Personal. Die Tomatensuppe war hervorragend. Komme gerne wieder!" } });
        await db.review.create({ data: { userId: users[0].id, rating: 5, title: "Wie zu Hause", comment: "Endlich eine Kantine, die wirklich gut kocht. Das Gemüse-Curry ist fantastisch und die Preise sind fair." } });
      }
    }

    // Tagesangebote
    const schnitzel = await db.menuItem.findUnique({ where: { slug: "wiener-schnitzel" } });
    const veggieCurry = await db.menuItem.findUnique({ where: { slug: "gemuese-curry" } });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (schnitzel) {
      const existing = await db.dailySpecial.findFirst({ where: { menuItemId: schnitzel.id, date: today } });
      if (!existing) {
        await db.dailySpecial.create({ data: { menuItemId: schnitzel.id, date: today, specialPrice: 9.90, note: "Unser Klassiker zum Sonderpreis!" } });
      }
    }
    if (veggieCurry) {
      const existing = await db.dailySpecial.findFirst({ where: { menuItemId: veggieCurry.id, date: today } });
      if (!existing) {
        await db.dailySpecial.create({ data: { menuItemId: veggieCurry.id, date: today, specialPrice: 8.50, note: "Vegan & lecker" } });
      }
    }

    // Admin erstellen
    const adminExists = await db.user.findUnique({ where: { email: "admin@culinarium.de" } });
    if (!adminExists) {
      const hash = await bcrypt.hash("admin123!", 12);
      await db.user.create({ data: { email: "admin@culinarium.de", name: "Admin", passwordHash: hash, role: "ADMIN" } });
    }

    return NextResponse.json({ success: true, message: "Demo-Daten erfolgreich geladen!" });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
