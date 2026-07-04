import { fetchJson } from "@/lib/api/fetch-json";
import type { AppData, Lead, UserRole, UserStatus } from "@/lib/types";
import type { ProspectContact } from "@/lib/prospecting-types";
import { toServiceTypeSlug } from "@/lib/service-types";

export type AuthSessionUser = {
  authId: string;
  email: string;
  profileId: string;
  fullName: string | null;
  role: UserRole;
  status: UserStatus;
};

export async function loadAuthMe(): Promise<AuthSessionUser> {
  const { user } = await fetchJson<{ user: AuthSessionUser }>("/api/auth/me");
  return user;
}

export async function loadBootstrap(): Promise<{ data: AppData; currentUser: AppData["users"][0] }> {
  return fetchJson("/api/bootstrap");
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  return fetchJson(url, { method: "POST", body: body ? JSON.stringify(body) : undefined });
}

export async function apiPatch<T>(url: string, body: unknown): Promise<T> {
  return fetchJson(url, { method: "PATCH", body: JSON.stringify(body) });
}

export async function apiDelete(url: string): Promise<void> {
  await fetchJson(url, { method: "DELETE" });
}

export async function createProspectApi(input: Partial<ProspectContact>) {
  return apiPost<{ data: Record<string, unknown> }>("/api/prospecting", input);
}

export async function updateProspectApi(id: string, patch: Partial<ProspectContact>) {
  return apiPatch<{ data: Record<string, unknown> }>(`/api/prospecting/${id}`, patch);
}

export async function deleteProspectApi(id: string) {
  await apiDelete(`/api/prospecting/${id}`);
}

export async function bulkProspectsApi(items: Partial<ProspectContact>[]) {
  return apiPost<{ data: Record<string, unknown>[] }>("/api/prospecting/bulk", { items });
}

export async function convertProspectApi(id: string) {
  return apiPost<{ data: Record<string, unknown> }>(`/api/prospecting/${id}/convert-to-lead`);
}

export async function createLeadApi(input: Record<string, unknown>) {
  return apiPost<{ data: Record<string, unknown> }>("/api/leads", input);
}

export async function approveLeadApi(id: string, comment?: string) {
  return apiPost(`/api/leads/${id}/approve`, { comment });
}

export async function rejectLeadApi(id: string, comment: string) {
  return apiPost(`/api/leads/${id}/reject`, { comment });
}

export async function markDuplicateLeadApi(id: string, comment: string) {
  return apiPost(`/api/leads/${id}/mark-duplicate`, { comment });
}

export async function doNotContactLeadApi(id: string) {
  return apiPost(`/api/leads/${id}/do-not-contact`);
}

export async function updateLeadApi(id: string, patch: Record<string, unknown>) {
  return apiPatch(`/api/leads/${id}`, patch);
}

export async function addLeadActivityApi(
  id: string,
  payload: { actionType: string; comment?: string; oldValue?: string; newValue?: string }
) {
  return apiPost(`/api/leads/${id}/activities`, payload);
}

export async function updateCommissionSettingsApi(patch: Record<string, unknown>) {
  return apiPatch("/api/settings/commission", patch);
}

export async function checkProspectDuplicateApi(input: Record<string, unknown>) {
  return apiPost<{ duplicate: unknown }>("/api/prospecting/check-duplicate", input);
}

export function mapLeadToApiCreate(input: Omit<Lead, "id" | "createdAt" | "updatedAt">): Record<string, unknown> {
  return {
    businessName: input.businessName,
    niche: input.niche || null,
    city: input.city || null,
    contactName: input.contactName || null,
    instagramUrl: input.instagramUrl || null,
    telegramUsername: input.telegramUsername || null,
    phone: input.phone || null,
    email: input.email || "",
    website: input.website || null,
    source: input.source || null,
    serviceType: toServiceTypeSlug(input.serviceType),
    estimatedBudget: input.estimatedBudget ?? 0,
    notes: input.notes || null,
    nextAction: input.nextAction || null,
  };
}

export function mapLeadToApiPatch(patch: Partial<import("@/lib/types").Lead>): Record<string, unknown> {
  const api: Record<string, unknown> = {};
  if (patch.businessName !== undefined) api.businessName = patch.businessName;
  if (patch.niche !== undefined) api.niche = patch.niche;
  if (patch.city !== undefined) api.city = patch.city;
  if (patch.contactName !== undefined) api.contactName = patch.contactName;
  if (patch.email !== undefined) api.email = patch.email;
  if (patch.phone !== undefined) api.phone = patch.phone;
  if (patch.website !== undefined) api.website = patch.website;
  if (patch.instagramUrl !== undefined) api.instagramUrl = patch.instagramUrl;
  if (patch.telegramUsername !== undefined) api.telegramUsername = patch.telegramUsername;
  if (patch.source !== undefined) api.source = patch.source;
  if (patch.serviceType !== undefined) api.serviceType = toServiceTypeSlug(patch.serviceType);
  if (patch.estimatedBudget !== undefined) api.estimatedBudget = patch.estimatedBudget;
  if (patch.notes !== undefined) api.notes = patch.notes;
  if (patch.nextAction !== undefined) api.nextAction = patch.nextAction;
  if (patch.status !== undefined) api.status = patch.status;
  if (patch.priority !== undefined) api.priority = patch.priority;
  if (patch.assignedManagerId !== undefined) api.assignedManagerId = patch.assignedManagerId;
  return api;
}

export function mapDealToApiCreate(input: {
  leadId: string;
  clientName: string;
  serviceType: string;
  amount: number;
  currency: string;
  notes: string;
}): Record<string, unknown> {
  return {
    leadId: input.leadId,
    clientName: input.clientName,
    serviceType: toServiceTypeSlug(input.serviceType),
    amount: input.amount,
    currency: input.currency,
    notes: input.notes || null,
  };
}

export async function createDealApi(input: Record<string, unknown>) {
  return apiPost<{ data: Record<string, unknown> }>("/api/deals", input);
}

export async function ensureDealForLeadApi(leadId: string) {
  return apiPost<{ data: Record<string, unknown>; created: boolean }>(`/api/leads/${leadId}/ensure-deal`);
}

export async function updateDealApi(
  id: string,
  patch: { amount?: number; notes?: string; serviceType?: string; clientName?: string }
) {
  const body: Record<string, unknown> = {};
  if (patch.amount !== undefined) body.amount = patch.amount;
  if (patch.notes !== undefined) body.notes = patch.notes;
  if (patch.serviceType !== undefined) body.serviceType = toServiceTypeSlug(patch.serviceType);
  if (patch.clientName !== undefined) body.clientName = patch.clientName;
  return apiPatch<{ data: Record<string, unknown> }>(`/api/deals/${id}`, body);
}

export async function markDealPaidApi(id: string) {
  return apiPost(`/api/deals/${id}/mark-paid`);
}

export async function cancelDealApi(id: string) {
  return apiPost(`/api/deals/${id}/cancel`);
}

export async function refundDealApi(id: string) {
  return apiPost(`/api/deals/${id}/refund`);
}

export async function createPayoutApi(input: Record<string, unknown>) {
  return apiPost<{ data: Record<string, unknown> }>("/api/payouts", input);
}

export async function markPayoutPaidApi(id: string) {
  return apiPost(`/api/payouts/${id}/mark-paid`);
}

export async function cancelPayoutApi(id: string) {
  return apiPost(`/api/payouts/${id}/cancel`);
}

export async function logoutApi() {
  await apiPost("/api/auth/logout");
}
