import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import { Adapter } from "next-auth/adapters"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcrypt"

// Wir verwenden die gleiche Konfiguration wie in auth.ts, aber erstellen eine eigene Handler-Instanz
const handler = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        // Suche User in DB
        const user = await prisma.user.findUnique({ where: { email: credentials.email }, select: { id: true, name: true, email: true, image: true, hashedPassword: true } });
        if (!user || !user.hashedPassword) {
          return null;
        }
        // Vergleiche Passwort
        const valid = await bcrypt.compare(credentials.password, user.hashedPassword);
        if (!valid) {
          return null;
        }
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
      console.error(`API Route Error [${code}]:`, metadata)
    },
    warn(code) {
      console.warn(`API Route Warning [${code}]`)
    },
    debug(code, metadata) {
      // Debug-Logs in Produktion deaktiviert
    },
  },
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
    async redirect({ url, baseUrl }) {
      // Make sure redirect always works properly
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl + "/chat";
    }
  }
})

export { handler as GET, handler as POST } 