export type ProspectStatus =
  | "new"
  | "needs_check"
  | "checked"
  | "duplicate"
  | "not_relevant"
  | "ready_to_message"
  | "messaged"
  | "follow_up_needed"
  | "replied"
  | "converted_to_lead"
  | "do_not_contact";

export type ProspectPriority = "low" | "medium" | "high";

export type WebsiteQuality =
  | "no_website"
  | "bad"
  | "average"
  | "good"
  | "unknown";

export type ProspectSource =
  | "2ГИС"
  | "Google Maps"
  | "Instagram"
  | "Threads"
  | "Telegram"
  | "Сайт компании"
  | "Kwork"
  | "Fiverr"
  | "Upwork"
  | "Freelancer"
  | "Знакомые"
  | "Другое";

export interface ProspectContact {
  id: string;
  businessName: string;
  niche: string;
  city: string;
  source: ProspectSource | string;
  website: string;
  instagram: string;
  telegram: string;
  phone: string;
  email: string;
  contactPerson: string;
  status: ProspectStatus;
  priority: ProspectPriority;
  websiteQuality: WebsiteQuality;
  hasWebsite: boolean | null;
  hasOnlineBooking: boolean;
  hasTelegramBot: boolean;
  hasCRM: boolean;
  painPoints: string;
  messageTemplateUsed: string;
  firstMessageSentAt: string | null;
  followUpAt: string | null;
  followUpSent: boolean;
  lastActionAt: string | null;
  notes: string;
  duplicateLeadId: string | null;
  convertedLeadId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProspectActivity {
  id: string;
  prospectId: string;
  userId: string;
  actionType: string;
  comment: string;
  createdAt: string;
}

export type ProspectDuplicateMatch = {
  type: "lead" | "prospect";
  id: string;
  businessName: string;
  status: string;
  createdBy: string;
  createdAt: string;
  matchedField: string;
};
