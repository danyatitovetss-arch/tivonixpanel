import { describe, it } from "node:test";
import assert from "node:assert";
import { calculateAge, validateLegalAge } from "../validation/legal";
import { calculateCommission } from "../commission";
import { toUserMessage, apiErrorMessage } from "../errors";

describe("user-facing errors", () => {
  it("translates login credentials", () => {
    assert.equal(toUserMessage("Invalid login credentials"), "Неверный email или пароль");
  });

  it("translates HTTP status fallback", () => {
    assert.equal(apiErrorMessage({}, 401), "Войдите в аккаунт");
  });
});

describe("legal age", () => {
  it("allows 16+", () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 20);
    const iso = dob.toISOString().slice(0, 10);
    assert.equal(validateLegalAge(iso), true);
    assert.equal(calculateAge(iso), 20);
  });

  it("blocks under 16", () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 15);
    const iso = dob.toISOString().slice(0, 10);
    assert.equal(validateLegalAge(iso), false);
  });
});

describe("calculateCommission", () => {
  it("10% under 2000", () => {
    const r = calculateCommission(1000, 0);
    assert.equal(r.amount, 100);
    assert.equal(r.percent, 10);
  });

  it("15% from 2000", () => {
    const r = calculateCommission(2000, 0);
    assert.equal(r.amount, 300);
    assert.equal(r.percent, 15);
  });

  it("bonus after 3 deals", () => {
    const r = calculateCommission(2000, 3);
    assert.equal(r.percent, 25);
    assert.equal(r.amount, 500);
    assert.equal(r.hasBonus, true);
  });
});
