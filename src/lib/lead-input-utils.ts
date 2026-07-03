/** Нормализация и форматирование полей формы лида */

export function stripAt(value: string): string {
  return value.replace(/^@+/, "").trim();
}

export function normalizeAtUsername(value: string): string {
  const v = stripAt(value);
  return v ? `@${v}` : "";
}

/** Цифры номера с кодом страны (без «+»), до 15 цифр по E.164 */
export function extractPhoneDigits(value: string): string {
  const trimmed = value.trim();
  let d = trimmed.replace(/\D/g, "");

  if (trimmed.startsWith("00") && d.startsWith("00")) {
    d = d.slice(2);
  }

  // Локальный RU: 8XXXXXXXXXX → 7XXXXXXXXXX
  if (d.length === 11 && d.startsWith("8")) {
    d = `7${d.slice(1)}`;
  }

  return d.slice(0, 15);
}

export function formatPhoneDisplay(digits: string): string {
  const d = extractPhoneDigits(digits);
  if (!d) return "";

  // Россия / Казахстан (+7)
  if (d.startsWith("7") && d.length >= 11) {
    const rest = d.slice(1);
    if (rest.length <= 3) return rest;
    if (rest.length <= 6) return `${rest.slice(0, 3)} ${rest.slice(3)}`;
    if (rest.length <= 8) return `${rest.slice(0, 3)} ${rest.slice(3, 6)}-${rest.slice(6)}`;
    return `${rest.slice(0, 3)} ${rest.slice(3, 6)}-${rest.slice(6, 8)}-${rest.slice(8, 10)}`;
  }

  // США / Канада (+1)
  if (d.startsWith("1") && d.length >= 11) {
    const rest = d.slice(1);
    if (rest.length <= 3) return rest;
    if (rest.length <= 6) return `${rest.slice(0, 3)} ${rest.slice(3)}`;
    return `${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6, 10)}`;
  }

  // Остальные страны — группы по 3 цифры
  const parts: string[] = [];
  for (let i = 0; i < d.length; i += 3) {
    parts.push(d.slice(i, i + 3));
  }
  return parts.join(" ");
}

export function phoneToStorage(digits: string): string {
  const d = extractPhoneDigits(digits);
  if (!d) return "";
  return `+${d}`;
}

export function isPhoneValid(digits: string): boolean {
  if (!extractPhoneDigits(digits)) return true;
  const len = extractPhoneDigits(digits).length;
  return len >= 8 && len <= 15;
}

/** @deprecated используйте extractPhoneDigits */
export function stripPhoneDigits(value: string): string {
  return extractPhoneDigits(value);
}

export function stripWebsite(value: string): string {
  return value.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "");
}

export function normalizeWebsite(value: string): string {
  const v = stripWebsite(value);
  return v ? `https://${v}` : "";
}

export function splitEmail(email: string): { local: string; domain: string } {
  if (!email?.trim()) return { local: "", domain: "" };
  const at = email.indexOf("@");
  if (at === -1) return { local: email.trim(), domain: "" };
  return { local: email.slice(0, at).trim(), domain: email.slice(at + 1).trim() };
}

export function combineEmail(local: string, domain: string): string {
  const l = local.trim();
  const d = domain.trim().replace(/^@+/, "");
  if (!l && !d) return "";
  if (l && d) return `${l}@${d}`.toLowerCase();
  return "";
}

export function isEmailValid(local: string, domain: string): boolean {
  if (!local.trim() && !domain.trim()) return true;
  if (!local.trim() || !domain.trim()) return false;
  return domain.includes(".") && local.length >= 1;
}

export function normEmail(email: string): string {
  return email.toLowerCase().trim();
}

export interface LeadFormContactInput {
  instagram: string;
  telegram: string;
  phoneIntl: string;
  emailLocal: string;
  emailDomain: string;
  website: string;
}

export function hasAnyContact(input: LeadFormContactInput): boolean {
  return Boolean(
    extractPhoneDigits(input.phoneIntl) ||
      combineEmail(input.emailLocal, input.emailDomain) ||
      stripAt(input.instagram) ||
      stripAt(input.telegram) ||
      stripWebsite(input.website)
  );
}

export function normalizeLeadContacts(input: LeadFormContactInput) {
  return {
    instagramUrl: normalizeAtUsername(input.instagram),
    telegramUsername: normalizeAtUsername(input.telegram),
    phone: phoneToStorage(input.phoneIntl),
    email: combineEmail(input.emailLocal, input.emailDomain),
    website: normalizeWebsite(input.website),
  };
}

export function calcFormProgress(businessName: string, contacts: LeadFormContactInput, detailsFilled: boolean): number {
  let score = 0;
  if (businessName.trim()) score += 35;
  if (hasAnyContact(contacts)) score += 35;
  if (detailsFilled) score += 30;
  return Math.min(100, score);
}
