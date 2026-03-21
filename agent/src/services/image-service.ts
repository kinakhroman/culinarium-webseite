/**
 * Image generation service for social media.
 * Uses OpenAI DALL-E API to generate food images.
 * Can be swapped with Stability AI or other providers.
 */
export async function generateFoodImage(
  dishName: string,
  description: string
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("OPENAI_API_KEY nicht gesetzt — Bildgenerierung übersprungen");
    return null;
  }

  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: `Professional food photography of "${dishName}": ${description}. Warm lighting, elegant plating on a white plate, shallow depth of field, restaurant-quality presentation. No text or watermarks.`,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      }),
    });

    if (!res.ok) {
      console.error("DALL-E Fehler:", await res.text());
      return null;
    }

    const data = await res.json();
    return data.data?.[0]?.url || null;
  } catch (error) {
    console.error("Bildgenerierung fehlgeschlagen:", error);
    return null;
  }
}
