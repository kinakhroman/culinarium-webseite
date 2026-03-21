import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen haben"),
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string().min(8, "Passwort muss mindestens 8 Zeichen haben"),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string().min(1, "Passwort ist erforderlich"),
});

export const menuItemSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  description: z.string().min(1, "Beschreibung ist erforderlich"),
  price: z.number().positive("Preis muss positiv sein"),
  categoryId: z.string().min(1, "Kategorie ist erforderlich"),
  imageUrl: z.string().optional(),
  isAvailable: z.boolean().default(true),
  isVegetarian: z.boolean().default(false),
  isVegan: z.boolean().default(false),
  isGlutenFree: z.boolean().default(false),
  allergens: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  description: z.string().optional(),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

export const orderSchema = z.object({
  orderType: z.enum(["PICKUP", "DELIVERY"]),
  requestedTime: z.string().optional(),
  notes: z.string().optional(),
  deliveryStreet: z.string().optional(),
  deliveryHouseNumber: z.string().optional(),
  deliveryPostalCode: z.string().optional(),
  deliveryCity: z.string().optional(),
  items: z.array(
    z.object({
      menuItemId: z.string(),
      quantity: z.number().int().positive(),
      notes: z.string().optional(),
    })
  ).min(1, "Mindestens ein Artikel ist erforderlich"),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(10, "Bewertung muss mindestens 10 Zeichen haben"),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Name ist erforderlich"),
  email: z.string().email("Ungültige E-Mail-Adresse"),
  subject: z.string().min(1, "Betreff ist erforderlich"),
  message: z.string().min(10, "Nachricht muss mindestens 10 Zeichen haben"),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen haben"),
  phone: z.string().optional(),
  street: z.string().optional(),
  houseNumber: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type MenuItemInput = z.infer<typeof menuItemSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
