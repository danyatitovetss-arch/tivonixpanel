import { apiErrorMessage } from "@/lib/errors";

function resolveApiUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = process.env.INTERNAL_API_URL?.replace(/\/$/, "");
  if (base && typeof window === "undefined") {
    return `${base}${url.startsWith("/") ? url : `/${url}`}`;
  }
  return url;
}

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(resolveApiUrl(url), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(apiErrorMessage(data, res.status));
  }
  return data as T;
}
