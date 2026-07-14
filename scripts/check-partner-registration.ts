import { partnerRegisterSchema } from "../src/lib/validation/partner-registration";

const cases = [
  {
    name: "accepts referral payload",
    ok: true,
    input: {
      fullName: "Иван Иванов",
      agencyName: null,
      telegram: "@ivanov",
      email: "ivan@example.com",
      websiteUrl: null,
      password: "password1",
      confirmPassword: "password1",
      partnerType: "referral" as const,
      acceptTerms: true,
    },
  },
  {
    name: "accepts white_label payload",
    ok: true,
    input: {
      fullName: "Анна Смит",
      agencyName: "Studio",
      telegram: "@anna",
      email: "anna@example.com",
      websiteUrl: "https://studio.dev",
      password: "password1",
      confirmPassword: "password1",
      partnerType: "white_label" as const,
      acceptTerms: true,
    },
  },
  {
    name: "rejects short password",
    ok: false,
    input: {
      fullName: "Иван Иванов",
      telegram: "@ivanov",
      email: "ivan@example.com",
      password: "short",
      confirmPassword: "short",
      partnerType: "referral" as const,
      acceptTerms: true,
    },
  },
  {
    name: "rejects mismatched passwords",
    ok: false,
    input: {
      fullName: "Иван Иванов",
      telegram: "@ivanov",
      email: "ivan@example.com",
      password: "password1",
      confirmPassword: "password2",
      partnerType: "referral" as const,
      acceptTerms: true,
    },
  },
  {
    name: "rejects missing terms",
    ok: false,
    input: {
      fullName: "Иван Иванов",
      telegram: "@ivanov",
      email: "ivan@example.com",
      password: "password1",
      confirmPassword: "password1",
      partnerType: "referral" as const,
      acceptTerms: false,
    },
  },
];

let failed = 0;

for (const test of cases) {
  const result = partnerRegisterSchema.safeParse(test.input);
  if (result.success !== test.ok) {
    failed += 1;
    console.error(`FAIL: ${test.name}`);
  } else {
    console.log(`OK: ${test.name}`);
  }
}

const privileged = partnerRegisterSchema.safeParse({
  fullName: "Hack",
  telegram: "@hack",
  email: "hack@example.com",
  password: "password1",
  confirmPassword: "password1",
  partnerType: "referral",
  acceptTerms: true,
  role: "admin",
  status: "active",
});

if (!privileged.success) {
  failed += 1;
  console.error("FAIL: valid base payload rejected");
} else if ("role" in privileged.data || "status" in privileged.data) {
  failed += 1;
  console.error("FAIL: privileged fields leaked into parsed data");
} else {
  console.log("OK: privileged fields not accepted in register schema");
}

if (failed > 0) {
  process.exit(1);
}

console.log("All partner registration validation checks passed");
