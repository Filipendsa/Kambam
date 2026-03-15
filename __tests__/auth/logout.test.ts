import { describe, it, expect } from "vitest";
import { authOptions } from "@/lib/auth";

describe("Logout (AUTH-04)", () => {
  it("AUTH-04: authOptions defines custom signIn page at /auth/signin", () => {
    expect(authOptions.pages?.signIn).toBe("/auth/signin");
  });

  it("AUTH-04: authOptions defines error page at /auth/error", () => {
    expect(authOptions.pages?.error).toBe("/auth/error");
  });
});
