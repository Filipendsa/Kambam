import type { NextAuthConfig } from "next-auth";

// Allowlist — specific emails only, NOT domain-based
// Per user requirement: filipe.nogueira@yesode.com and davi.ribeiro@yesode.com
// Note: Using allowlist (not endsWith("@yesode.com")) — other @yesode.com emails are rejected
export const ALLOWED_EMAILS: string[] = (
  process.env.ALLOWED_EMAILS?.split(",") || [
    "filipe.nogueira@yesode.com",
    "davi.ribeiro@yesode.com",
  ]
).map((e) => e.trim());

export const authOptions: NextAuthConfig = {
  providers: [],
  callbacks: {
    async signIn({ profile }) {
      // Require email to be verified AND in the specific allowlist
      if (
        profile?.email_verified === true &&
        ALLOWED_EMAILS.includes(profile.email as string)
      ) {
        return true;
      }
      return false;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/dashboard`;
    },
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Refresh session record daily
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
};

// Lazy initialization — only run when imported in server context (not in tests)
// This prevents next/server import errors in vitest
let _auth: ReturnType<typeof import("next-auth").default> | undefined;

export async function getAuthHandlers() {
  if (!_auth) {
    const NextAuth = (await import("next-auth")).default;
    const Google = (await import("next-auth/providers/google")).default;
    const { PrismaAdapter } = await import("@auth/prisma-adapter");
    const { db } = await import("./db");

    const fullConfig: NextAuthConfig = {
      ...authOptions,
      trustHost: true,
      adapter: PrismaAdapter(db),
      providers: [
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          allowDangerousEmailAccountLinking: false,
        }),
      ],
    };

    _auth = NextAuth(fullConfig);
  }
  return _auth;
}

// For use in Next.js server components, API routes, and middleware
// These use dynamic imports to avoid triggering next/server in test environment
export const handlers = {
  GET: async (req: Request) => (await getAuthHandlers()).handlers.GET(req as any),
  POST: async (req: Request) => (await getAuthHandlers()).handlers.POST(req as any),
};

// Development bypass — set NEXTAUTH_DEV_BYPASS=true in .env.local to skip Google Auth
const DEV_BYPASS =
  process.env.NODE_ENV === "development" &&
  process.env.NEXTAUTH_DEV_BYPASS === "true";

const DEV_SESSION = {
  user: {
    id: "dev-user",
    name: "Dev User",
    email: "filipe.nogueira@yesode.com",
    image: null,
  },
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

export const auth = async (...args: any[]) => {
  if (DEV_BYPASS) return DEV_SESSION;
  return ((await getAuthHandlers()) as any).auth(...args);
};

export const signIn = async (...args: any[]) =>
  ((await getAuthHandlers()) as any).signIn(...args);

export const signOut = async (...args: any[]) =>
  ((await getAuthHandlers()) as any).signOut(...args);
