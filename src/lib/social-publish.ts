/**
 * Veröffentlicht Beiträge auf Facebook (Seite) und Instagram (Business-Konto)
 * über die Meta Graph API.
 *
 * Benötigte Umgebungsvariablen:
 *   META_GRAPH_TOKEN          – langlebiges Page-Access-Token (für FB-Seite UND IG-Publishing)
 *   FACEBOOK_PAGE_ID          – ID der Facebook-Seite
 *   INSTAGRAM_BUSINESS_ACCOUNT_ID – ID des verknüpften Instagram-Business-Kontos
 *
 * Instagram verlangt eine öffentlich erreichbare Bild-URL (z. B. die Menü-Grafik
 * unter /api/menu-poster/square). Reine Text-Posts gehen nur auf Facebook.
 */

const GRAPH = "https://graph.facebook.com/v22.0";

export type PublishResult = {
  ok: boolean;
  platform: "facebook" | "instagram";
  id?: string;
  error?: string;
};

function token() {
  return process.env.META_GRAPH_TOKEN || process.env.FACEBOOK_PAGE_ACCESS_TOKEN || "";
}

/** true, wenn Token + beide IDs gesetzt sind (Auto-Posten möglich). */
export function metaConfigured(): boolean {
  return !!(
    token() &&
    process.env.FACEBOOK_PAGE_ID &&
    process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID
  );
}

/** Facebook-Seitenbeitrag. Mit imageUrl wird ein Foto gepostet, sonst nur Text. */
export async function postToFacebook(
  message: string,
  imageUrl?: string
): Promise<PublishResult> {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const t = token();
  if (!pageId || !t) {
    return { ok: false, platform: "facebook", error: "FACEBOOK_PAGE_ID oder Token fehlt" };
  }
  try {
    const endpoint = imageUrl ? `${GRAPH}/${pageId}/photos` : `${GRAPH}/${pageId}/feed`;
    const body = new URLSearchParams({ access_token: t });
    if (imageUrl) {
      body.set("url", imageUrl);
      body.set("caption", message);
    } else {
      body.set("message", message);
    }
    const res = await fetch(endpoint, { method: "POST", body });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, platform: "facebook", error: data?.error?.message || `HTTP ${res.status}` };
    }
    return { ok: true, platform: "facebook", id: data.id || data.post_id };
  } catch (e) {
    return { ok: false, platform: "facebook", error: e instanceof Error ? e.message : "Fehler" };
  }
}

/** Instagram-Beitrag (Bild-URL Pflicht): 1) Container erstellen 2) veröffentlichen. */
export async function postToInstagram(
  caption: string,
  imageUrl: string
): Promise<PublishResult> {
  const igId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const t = token();
  if (!igId || !t) {
    return { ok: false, platform: "instagram", error: "INSTAGRAM_BUSINESS_ACCOUNT_ID oder Token fehlt" };
  }
  if (!imageUrl) {
    return { ok: false, platform: "instagram", error: "Instagram braucht eine Bild-URL" };
  }
  try {
    // 1) Media-Container anlegen
    const createBody = new URLSearchParams({ image_url: imageUrl, caption, access_token: t });
    const createRes = await fetch(`${GRAPH}/${igId}/media`, { method: "POST", body: createBody });
    const createData = await createRes.json();
    if (!createRes.ok || !createData.id) {
      return { ok: false, platform: "instagram", error: createData?.error?.message || `Container-Fehler HTTP ${createRes.status}` };
    }
    // 2) Veröffentlichen
    const pubBody = new URLSearchParams({ creation_id: createData.id, access_token: t });
    const pubRes = await fetch(`${GRAPH}/${igId}/media_publish`, { method: "POST", body: pubBody });
    const pubData = await pubRes.json();
    if (!pubRes.ok || !pubData.id) {
      return { ok: false, platform: "instagram", error: pubData?.error?.message || `Publish-Fehler HTTP ${pubRes.status}` };
    }
    return { ok: true, platform: "instagram", id: pubData.id };
  } catch (e) {
    return { ok: false, platform: "instagram", error: e instanceof Error ? e.message : "Fehler" };
  }
}

/** Instagram-Story (Bild). Wie Feed-Post, aber media_type=STORIES. Verschwindet nach 24 h. */
export async function postStoryToInstagram(imageUrl: string): Promise<PublishResult> {
  const igId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const t = token();
  if (!igId || !t) {
    return { ok: false, platform: "instagram", error: "INSTAGRAM_BUSINESS_ACCOUNT_ID oder Token fehlt" };
  }
  if (!imageUrl) {
    return { ok: false, platform: "instagram", error: "Story braucht eine Bild-URL" };
  }
  try {
    const createBody = new URLSearchParams({
      image_url: imageUrl,
      media_type: "STORIES",
      access_token: t,
    });
    const createRes = await fetch(`${GRAPH}/${igId}/media`, { method: "POST", body: createBody });
    const createData = await createRes.json();
    if (!createRes.ok || !createData.id) {
      return { ok: false, platform: "instagram", error: createData?.error?.message || `Story-Container-Fehler HTTP ${createRes.status}` };
    }
    const pubBody = new URLSearchParams({ creation_id: createData.id, access_token: t });
    const pubRes = await fetch(`${GRAPH}/${igId}/media_publish`, { method: "POST", body: pubBody });
    const pubData = await pubRes.json();
    if (!pubRes.ok || !pubData.id) {
      return { ok: false, platform: "instagram", error: pubData?.error?.message || `Story-Publish-Fehler HTTP ${pubRes.status}` };
    }
    return { ok: true, platform: "instagram", id: pubData.id };
  } catch (e) {
    return { ok: false, platform: "instagram", error: e instanceof Error ? e.message : "Fehler" };
  }
}

/** Postet denselben Beitrag (Bild + Text) auf beide Plattformen. */
export async function postToBoth(
  caption: string,
  imageUrl: string
): Promise<PublishResult[]> {
  return Promise.all([postToInstagram(caption, imageUrl), postToFacebook(caption, imageUrl)]);
}
