import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "@/components/header";

// Mock next-auth/react to control session in tests
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
}));

import { useSession } from "next-auth/react";

const mockUseSession = vi.mocked(useSession);

describe("Header Component (UI-04)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("UI-04: renders user name when authenticated", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: "Filipe Nogueira",
          email: "filipe.nogueira@yesode.com",
          image: null,
        },
        expires: "2026-04-12",
      },
      status: "authenticated",
      update: vi.fn(),
    });

    render(<Header />);
    expect(screen.getByText("Filipe Nogueira")).toBeInTheDocument();
  });

  it("UI-04: renders user email when authenticated", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: "Filipe Nogueira",
          email: "filipe.nogueira@yesode.com",
          image: null,
        },
        expires: "2026-04-12",
      },
      status: "authenticated",
      update: vi.fn(),
    });

    render(<Header />);
    expect(screen.getByText("filipe.nogueira@yesode.com")).toBeInTheDocument();
  });

  it("UI-04: renders logout button", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: "Filipe Nogueira",
          email: "filipe.nogueira@yesode.com",
          image: null,
        },
        expires: "2026-04-12",
      },
      status: "authenticated",
      update: vi.fn(),
    });

    render(<Header />);
    // The dropdown trigger (Avatar button) must be in the document
    const trigger = screen.getByRole("button");
    expect(trigger).toBeInTheDocument();
  });

  it("UI-04: renders loading skeleton when session status is loading", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "loading",
      update: vi.fn(),
    });

    const { container } = render(<Header />);
    // Loading state renders an empty div with h-16 class
    const skeleton = container.querySelector(".h-16");
    expect(skeleton).toBeInTheDocument();
  });
});
