import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import { Adapter } from "next-auth/adapters"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcrypt"

// Client-seitige Authentifizierung - verwendet von der Anwendung, nicht von den API-Routen
export const { auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("Client - Attempting credentials authorization with:", { email: credentials?.email });
        if (!credentials?.email || !credentials?.password) return null;
        // Suche User in DB
        const user = await prisma.user.findUnique({ where: { email: credentials.email }, select: { id: true, name: true, email: true, image: true, hashedPassword: true } });
        console.log("[LOGIN] User fetched:", user);
        if (!user || !user.hashedPassword) {
          console.log("[LOGIN] User not found or no hashedPassword");
          return null;
        }
        // Vergleiche Passwort
        const valid = await bcrypt.compare(credentials.password, user.hashedPassword);
        console.log("[LOGIN] bcrypt.compare result:", valid);
        if (!valid) {
          console.log("[LOGIN] Password invalid");
          return null;
        }
        console.log("[LOGIN] Login successful for:", user.email);
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      }
    })
  ],
  debug: true,
  pages: {
    signIn: "/login",
    error: "/error",
  },
  logger: {
    error(code, metadata) {
      console.error(`Client Auth Error [${code}]:`, metadata)
    },
    warn(code) {
      console.warn(`Client Auth Warning [${code}]`)
    },
    debug(code, metadata) {
      console.log(`Client Auth Debug [${code}]:`, metadata)
    },
  },
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async session({ session, token }) {
      console.log("Client - Session callback called with token:", token);
      if (session.user) {
        session.user.id = token.sub as string;
      }
      return session
    },
    async jwt({ token, user }) {
      console.log("Client - JWT callback called with user:", user);
      if (user) {
        token.sub = user.id
      }
      return token
    },
    async redirect({ url, baseUrl }) {
      console.log("Client - Redirect callback:", { url, baseUrl });
      // Make sure redirect always works properly
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl + "/chat";
    }
  }
}) 