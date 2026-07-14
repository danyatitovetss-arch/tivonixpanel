import { DEFAULT_COMMISSION_SETTINGS } from "./commission";
import type { AppData, User } from "./types";

export const PLACEHOLDER_USER: User = {
  id: "",
  name: "",
  email: "",
  telegram: "",
  role: "partner",
  status: "inactive",
  partnerType: null,
  agencyName: null,
  websiteUrl: null,
  commissionPercentOverride: null,
  assignedManagerId: null,
  createdAt: "",
};

export function emptyAppData(): AppData {
  return {
    users: [],
    leads: [],
    leadActivities: [],
    deals: [],
    balanceTransactions: [],
    payouts: [],
    commissionSettings: {
      id: "",
      ...DEFAULT_COMMISSION_SETTINGS,
      updatedAt: "",
    },
    prospectContacts: [],
    prospectActivities: [],
    partnerProfiles: [],
  };
}
