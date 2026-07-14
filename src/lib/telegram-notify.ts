import "server-only";

import { getPublicAppOrigin } from "@/lib/app-url";

/**
 * Optional admin Telegram notify for new partner applications.
 * Failures must never break registration.
 */
export async function notifyAdminPartnerApplication(payload: {
  fullName: string;
  email: string;
  telegram: string;
  partnerType: "referral" | "white_label";
  agencyName?: string | null;
}): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID?.trim();
  if (!token || !chatId) return;

  const typeLabel = payload.partnerType === "referral" ? "Referral" : "White-label";
  const adminUrl = `${getPublicAppOrigin()}/admin/partner-applications`;
  const lines = [
    "Новая заявка партнёра TIVONIX",
    `Формат: ${typeLabel}`,
    `Имя: ${payload.fullName}`,
    `Email: ${payload.email}`,
    `Telegram: ${payload.telegram}`,
  ];
  if (payload.agencyName) {
    lines.push(`Агентство: ${payload.agencyName}`);
  }
  lines.push(`Админка: ${adminUrl}`);

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join("\n"),
        disable_web_page_preview: true,
      }),
    });
  } catch {
    // notification is best-effort
  }
}
