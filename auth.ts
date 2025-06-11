import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import { Adapter } from "next-auth/adapters"
import CredentialsProvider from "next-auth/providers/credentials"

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
        
        // This is a simple demo auth - in production, you'd want to use a real authentication system
        if (credentials?.email === "demo@example.com" && credentials?.password === "demo") {
          console.log("Client - Credentials login successful");
          const user = {
            id: "demo-user",
            name: "Demo User",
            email: "demo@example.com",
            image: null
          };
          // Die Benutzererstellung erfolgt in der API-Route
          return user;
        }
        
        console.log("Client - Credentials login failed");
        return null;
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