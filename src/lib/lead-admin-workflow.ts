import type { AdminReviewStatus, Lead, LeadStatus } from "./types";

const WORKFLOW_STATUSES: LeadStatus[] = [
  "contacted",
  "replied",
  "interested",
  "sent_to_team",
  "offer_sent",
  "won",
  "lost",
  "no_response",
];

/** Синхронизирует adminReviewStatus при смене рабочего статуса */
export function syncAdminReviewForStatus(
  newStatus: LeadStatus,
  currentReview: AdminReviewStatus
): AdminReviewStatus | undefined {
  switch (newStatus) {
    case "pending_review":
      return "pending";
    case "approved":
      return "approved";
    case "rejected":
      return "rejected";
    case "duplicate":
      return "duplicate";
    case "do_not_contact":
      return "do_not_contact";
    default:
      break;
  }

  if (WORKFLOW_STATUSES.includes(newStatus) && currentReview === "pending") {
    return "approved";
  }

  return undefined;
}

export function isLeadPendingAdminReview(lead: Lead): boolean {
  return lead.status === "pending_review" || lead.adminReviewStatus === "pending";
}

export function isLeadReviewTerminal(lead: Lead): boolean {
  return (
    lead.adminReviewStatus === "rejected" ||
    lead.adminReviewStatus === "duplicate" ||
    lead.adminReviewStatus === "do_not_contact" ||
    lead.status === "rejected" ||
    lead.status === "duplicate" ||
    lead.status === "do_not_contact"
  );
}

export function isLeadClosed(lead: Lead): boolean {
  return lead.status === "won";
}

export interface AdminActionVisibility {
  approve: boolean;
  reject: boolean;
  duplicate: boolean;
  doNotContact: boolean;
  status: boolean;
  manager: boolean;
  createDeal: boolean;
  editDeal: boolean;
}

export function getAdminActionVisibility(lead: Lead, hasDeal: boolean): AdminActionVisibility {
  const pendingReview = isLeadPendingAdminReview(lead);
  const reviewTerminal = isLeadReviewTerminal(lead);
  const closed = isLeadClosed(lead);

  return {
    approve: pendingReview,
    reject: pendingReview,
    duplicate: pendingReview,
    doNotContact: !reviewTerminal && !closed && lead.adminReviewStatus !== "do_not_contact",
    status: true,
    manager: !reviewTerminal || closed,
    createDeal: !hasDeal && !pendingReview && !reviewTerminal && !closed,
    editDeal: hasDeal,
  };
}

/** Статусы в модалке «Изменить статус» — сгруппированы по смыслу */
export const ADMIN_STATUS_GROUPS: { label: string; statuses: LeadStatus[] }[] = [
  {
    label: "Проверка",
    statuses: ["pending_review", "approved", "rejected", "duplicate", "do_not_contact"],
  },
  {
    label: "В работе",
    statuses: ["contacted", "replied", "interested", "sent_to_team", "offer_sent", "no_response"],
  },
  {
    label: "Итог",
    statuses: ["won", "lost"],
  },
];

export function getAdminStatusOptions(lead: Lead): LeadStatus[] {
  if (isLeadPendingAdminReview(lead)) {
    return ADMIN_STATUS_GROUPS.flatMap((g) => g.statuses);
  }
  if (isLeadReviewTerminal(lead)) {
    return ["rejected", "duplicate", "do_not_contact", "approved", "pending_review"];
  }
  return ADMIN_STATUS_GROUPS.flatMap((g) => g.statuses);
}
