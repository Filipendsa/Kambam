import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

// Full config for middleware — includes adapter and providers
// This file runs in Next.js server context only (never in vitest)
const { auth } = NextAuth({
  ...authOptions,
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
});

export { auth as proxy };

export const config = {
  // Protect only dashboard routes — auth and api/auth routes are public
  matcher: ["/dashboard/:path*"],
};
