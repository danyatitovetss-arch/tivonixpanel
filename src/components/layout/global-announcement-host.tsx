"use client";

import { GlobalAnnouncementModal } from "@/components/layout/global-announcement-modal";
import { useCurrentUser, useIsBootstrapping } from "@/lib/store";

export function GlobalAnnouncementHost() {
  const isBootstrapping = useIsBootstrapping();
  const currentUser = useCurrentUser();
  const ready = !isBootstrapping && Boolean(currentUser.id);

  return <GlobalAnnouncementModal ready={ready} />;
}
