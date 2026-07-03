import type { PartnerProfile } from "./types";

export function createSeedPartnerProfiles(): PartnerProfile[] {
  return [
    {
      userId: "u-admin",
      phone: "+375 29 100 00 01",
      city: "Минск",
      country: "Беларусь",
      paymentMethod: "Карта",
      paymentDetails: "**** 4821",
      onboardingCompletedAt: "2026-01-01",
    },
    {
      userId: "u-andrey",
      phone: "+375 29 555 12 34",
      city: "Минск",
      country: "Беларусь",
      paymentMethod: "USDT (TRC-20)",
      paymentDetails: "TXk9…4F2a",
      onboardingCompletedAt: "2026-01-15",
    },
    {
      userId: "u-maxim",
      phone: "+375 33 777 88 99",
      city: "Гродно",
      country: "Беларусь",
      paymentMethod: "Карта",
      paymentDetails: "**** 9034",
      onboardingCompletedAt: "2026-02-01",
    },
    {
      userId: "u-artem",
      phone: "+375 44 222 33 44",
      city: "Минск",
      country: "Беларусь",
      paymentMethod: "Карта",
      paymentDetails: "**** 7712",
      onboardingCompletedAt: "2026-02-10",
    },
    {
      userId: "u-ilya",
      phone: "+375 25 333 44 55",
      city: "Брест",
      country: "Беларусь",
      paymentMethod: "Карта",
      paymentDetails: "**** 1188",
      onboardingCompletedAt: "2026-03-01",
    },
    {
      userId: "u-nikita",
      phone: "+375 29 666 77 88",
      city: "Минск",
      country: "Беларусь",
      paymentMethod: "USDT (TRC-20)",
      paymentDetails: "TQ7…9Bm1",
      onboardingCompletedAt: "2026-03-15",
    },
  ];
}

export function emptyPartnerProfile(userId: string): PartnerProfile {
  return {
    userId,
    phone: "",
    city: "",
    country: "Беларусь",
    paymentMethod: "",
    paymentDetails: "",
    onboardingCompletedAt: new Date().toISOString().slice(0, 10),
  };
}
