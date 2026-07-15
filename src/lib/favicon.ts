/** Favicon URL for a domain via Google Favicons (redirects to gstatic). */
export function faviconUrl(domain: string, size: 16 | 32 | 64 | 128 = 64): string {
  const clean = domain.replace(/^www\./, "").trim();
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(clean)}&sz=${size}`;
}

export function faviconUrlFromHref(url: string, size: 16 | 32 | 64 | 128 = 64): string | null {
  try {
    const domain = new URL(url).hostname.replace(/^www\./, "");
    return faviconUrl(domain, size);
  } catch {
    return null;
  }
}
