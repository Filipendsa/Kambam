import { describe, it, expect } from "vitest";
import { authOptions } from "@/lib/auth";

describe("Session Persistence (AUTH-03)", () => {
  it("AUTH-03: authOptions uses database session strategy", () => {
    expect(authOptions.session?.strategy).toBe("database");
  });

  it("AUTH-03: session maxAge is 30 days (2592000 seconds)", () => {
    const thirtyDays = 30 * 24 * 60 * 60;
    expect(authOptions.session?.maxAge).toBe(thirtyDays);
  });
});
