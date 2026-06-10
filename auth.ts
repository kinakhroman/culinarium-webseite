import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { authConfig } from "./auth.config";

// Social-Login-Provider nur aktivieren, wenn die Zugangsdaten gesetzt sind,
// damit fehlende Schlüssel die App nicht crashen lassen.
const oauthProviders = [];
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  oauthProviders.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
}
if (process.env.AUTH_APPLE_ID && process.env.AUTH_APPLE_SECRET) {
  oauthProviders.push(
    Apple({
      clientId: process.env.AUTH_APPLE_ID,
      clientSecret: process.env.AUTH_APPLE_SECRET,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // Hinter dem Hostinger-Proxy (LiteSpeed) den Host vertrauen
  trustHost: true,
  providers: [
    ...oauthProviders,
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-Mail", type: "email" },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );
        if (!passwordMatch) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    ...authConfig.callbacks,
    // Bei Google/Apple: Nutzer in unserer DB anlegen, falls noch nicht vorhanden
    async signIn({ user, account }) {
      if (!account || account.provider === "credentials") return true;
      const email = user.email;
      if (!email) return false;

      const existing = await db.user.findUnique({ where: { email } });
      if (!existing) {
        await db.user.create({
          data: {
            email,
            name: user.name || email.split("@")[0],
            // Zufalls-Hash: Credentials-Login ist damit nicht möglich (nur Social)
            passwordHash: randomBytes(24).toString("hex"),
            emailVerified: new Date(),
          },
        });
      }
      return true;
    },
    // DB-Nutzer (id + Rolle) in den Token laden – auch für Social-Logins
    async jwt({ token, user, account }) {
      if (user && account && account.provider !== "credentials" && user.email) {
        const dbUser = await db.user.findUnique({ where: { email: user.email } });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
        return token;
      }
      return authConfig.callbacks!.jwt!({ token, user } as never);
    },
  },
});
