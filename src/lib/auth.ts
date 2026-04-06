import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Discord from "next-auth/providers/discord";
import bcrypt from "bcryptjs";
import { db } from "./db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const normalizedEmail = (credentials.email as string).trim().toLowerCase();
        const user = await db.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user || !user.passwordHash) return null;
        if (user.bannedAt) {
          throw new Error("Account suspended");
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Block OAuth sign-ins for banned users
      if (user.id) {
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { bannedAt: true },
        });
        if (dbUser?.bannedAt) return false;
      } else if (user.email) {
        const dbUser = await db.user.findUnique({
          where: { email: user.email },
          select: { bannedAt: true },
        });
        if (dbUser?.bannedAt) return false;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        // First sign-in: fetch role from DB and embed in token
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { id: true, role: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;

        // Always fetch latest user data from DB so role/avatar/name are current
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
            select: { avatar: true, name: true, role: true },
          });
          if (dbUser) {
            if (dbUser.avatar) session.user.image = dbUser.avatar;
            if (dbUser.name) session.user.name = dbUser.name;
            (session.user as any).role = dbUser.role;
          }
        } catch {
          // ignore — use whatever's in token
        }
      }
      return session;
    },
  },
});
