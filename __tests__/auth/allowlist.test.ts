import { describe, it, expect } from "vitest";
import { authOptions, ALLOWED_EMAILS } from "@/lib/auth";

// Extract the signIn callback for direct unit testing
const signInCallback = authOptions.callbacks?.signIn as Function;

describe("Email Allowlist (AUTH-01, AUTH-02)", () => {
  it("AUTH-01: allows filipe.nogueira@yesode.com to sign in", async () => {
    const result = await signInCallback({
      profile: { email: "filipe.nogueira@yesode.com", email_verified: true },
    });
    expect(result).toBe(true);
  });

  it("AUTH-01: allows davi.ribeiro@yesode.com to sign in", async () => {
    const result = await signInCallback({
      profile: { email: "davi.ribeiro@yesode.com", email_verified: true },
    });
    expect(result).toBe(true);
  });

  it("AUTH-02: denies other@yesode.com (domain match but not in allowlist)", async () => {
    const result = await signInCallback({
      profile: { email: "other@yesode.com", email_verified: true },
    });
    expect(result).toBe(false);
  });

  it("AUTH-02: denies attacker@gmail.com", async () => {
    const result = await signInCallback({
      profile: { email: "attacker@gmail.com", email_verified: true },
    });
    expect(result).toBe(false);
  });

  it("AUTH-02: denies email with email_verified=false even if in allowlist", async () => {
    const result = await signInCallback({
      profile: { email: "filipe.nogueira@yesode.com", email_verified: false },
    });
    expect(result).toBe(false);
  });
});
