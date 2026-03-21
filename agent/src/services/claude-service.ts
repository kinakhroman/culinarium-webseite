import Anthropic from "anthropic";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export async function generateSocialCaption(
  menuItems: { name: string; description: string; price: number }[],
  platform: "instagram" | "facebook"
): Promise<{ caption: string; hashtags: string }> {
  const anthropic = getClient();

  const menuText = menuItems
    .map((item) => `- ${item.name}: ${item.description} (${item.price.toFixed(2)} EUR)`)
    .join("\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: `Du bist ein Social-Media-Manager für "Culinarium am Biesenhorst", eine Berliner Kantine.
Erstelle einen ansprechenden ${platform === "instagram" ? "Instagram" : "Facebook"}-Beitrag basierend auf dem heutigen Menü:

${menuText}

Der Ton soll freundlich, appetitanregend und einladend sein. Schreibe auf Deutsch.
Gib das Ergebnis in diesem Format zurück:
CAPTION: [Dein Beitrag hier]
HASHTAGS: [Relevante Hashtags mit #]`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const captionMatch = text.match(/CAPTION:\s*([\s\S]*?)(?=HASHTAGS:|$)/);
  const hashtagsMatch = text.match(/HASHTAGS:\s*(.*)/);

  return {
    caption: captionMatch?.[1]?.trim() || text,
    hashtags: hashtagsMatch?.[1]?.trim() || "#Culinarium #BerlinFood #Kantine #Mittagessen",
  };
}
