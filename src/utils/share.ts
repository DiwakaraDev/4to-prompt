// src/utils/share.ts

export interface ShareData {
  title:       string;
  text:        string;
  promptId:    string;
  imageUrl?:   string;
}

export function getShareUrl(promptId: string): string {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return `${base}/prompt/${promptId}`;
}

export async function copyShareLink(promptId: string): Promise<void> {
  await navigator.clipboard.writeText(getShareUrl(promptId));
}

export function shareToWhatsApp(data: ShareData): void {
  const text = encodeURIComponent(
    `${data.title}\n\nCheck this AI prompt 👇\n${getShareUrl(data.promptId)}`
  );
  window.open(`https://wa.me/?text=${text}`, "_blank", "noopener");
}

export function shareToTwitter(data: ShareData): void {
  const text   = encodeURIComponent(`${data.title} — ${data.text.slice(0, 80)}...`);
  const url    = encodeURIComponent(getShareUrl(data.promptId));
  const tags   = encodeURIComponent("AIArt,MidJourney,AIPrompt");
  window.open(
    `https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=${tags}`,
    "_blank", "noopener"
  );
}

export function shareToFacebook(data: ShareData): void {
  const url = encodeURIComponent(getShareUrl(data.promptId));
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    "_blank", "noopener"
  );
}

export async function nativeShare(data: ShareData): Promise<boolean> {
  if (!navigator.share) return false;
  try {
    await navigator.share({
      title: data.title,
      text:  data.text.slice(0, 100),
      url:   getShareUrl(data.promptId),
    });
    return true;
  } catch {
    return false;
  }
}