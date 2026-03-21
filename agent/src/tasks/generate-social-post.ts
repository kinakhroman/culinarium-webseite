import { db } from "../lib/db.js";
import { logAgentTask } from "../lib/logger.js";
import { generateSocialCaption } from "../services/claude-service.js";
import { generateFoodImage } from "../services/image-service.js";

export async function generateSocialPost() {
  try {
    // Check if we already generated a post today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingPost = await db.socialPost.findFirst({
      where: { createdAt: { gte: today, lt: tomorrow } },
    });

    if (existingPost) {
      await logAgentTask("generate-social-post", "SKIPPED", "Beitrag für heute bereits erstellt");
      return;
    }

    // Get today's specials or random menu items for content
    const specials = await db.dailySpecial.findMany({
      where: { date: { gte: today, lt: tomorrow }, isActive: true },
      include: { menuItem: true },
    });

    let menuItems: { name: string; description: string; price: number }[];

    if (specials.length > 0) {
      menuItems = specials.map((s) => ({
        name: s.menuItem.name,
        description: s.menuItem.description,
        price: s.specialPrice || s.menuItem.price,
      }));
    } else {
      const items = await db.menuItem.findMany({
        where: { isAvailable: true },
        take: 3,
        orderBy: { updatedAt: "desc" },
      });
      menuItems = items.map((i) => ({
        name: i.name,
        description: i.description,
        price: i.price,
      }));
    }

    if (menuItems.length === 0) {
      await logAgentTask("generate-social-post", "SKIPPED", "Keine Menüeinträge verfügbar");
      return;
    }

    // Generate captions for both platforms
    for (const platform of ["instagram", "facebook"] as const) {
      try {
        const { caption, hashtags } = await generateSocialCaption(menuItems, platform);

        // Optionally generate image
        const mainDish = menuItems[0];
        const imageUrl = await generateFoodImage(mainDish.name, mainDish.description);

        await db.socialPost.create({
          data: {
            platform,
            caption,
            hashtags,
            imageUrl,
            status: "DRAFT",
          },
        });

        await logAgentTask(
          "generate-social-post",
          "SUCCESS",
          `${platform}-Beitrag als Entwurf erstellt`,
          { platform, hasImage: !!imageUrl }
        );
      } catch (err) {
        await logAgentTask(
          "generate-social-post",
          "FAILURE",
          `${platform}-Beitrag fehlgeschlagen: ${err}`
        );
      }
    }
  } catch (error) {
    await logAgentTask("generate-social-post", "FAILURE", String(error));
  }
}
