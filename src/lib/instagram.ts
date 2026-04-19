export type InstagramMediaType = "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";

export type InstagramPost = {
  id: string;
  caption?: string;
  mediaType: InstagramMediaType;
  mediaUrl: string;
  thumbnailUrl?: string;
  permalink: string;
  timestamp: string;
};

const GRAPH_URL = "https://graph.instagram.com/v22.0";
const FIELDS = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";

export async function getInstagramPosts(limit = 12): Promise<InstagramPost[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return [];

  try {
    const url = `${GRAPH_URL}/me/media?fields=${FIELDS}&limit=${limit}&access_token=${token}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
      console.error("[instagram] fetch failed:", res.status, await res.text().catch(() => ""));
      return [];
    }

    const data = await res.json();
    const posts: InstagramPost[] = (data.data ?? [])
      .filter((p: { media_type: InstagramMediaType; thumbnail_url?: string }) =>
        p.media_type !== "VIDEO" || p.thumbnail_url
      )
      .map((p: {
        id: string;
        caption?: string;
        media_type: InstagramMediaType;
        media_url: string;
        thumbnail_url?: string;
        permalink: string;
        timestamp: string;
      }) => ({
        id: p.id,
        caption: p.caption,
        mediaType: p.media_type,
        mediaUrl: p.media_url,
        thumbnailUrl: p.thumbnail_url,
        permalink: p.permalink,
        timestamp: p.timestamp,
      }));

    return posts;
  } catch (err) {
    console.error("[instagram] error:", err);
    return [];
  }
}

export async function refreshInstagramToken(token: string): Promise<{ access_token: string; expires_in: number } | null> {
  const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
