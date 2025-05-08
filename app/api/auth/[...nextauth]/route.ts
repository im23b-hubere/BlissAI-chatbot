import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import StackExchangeProvider from "@/lib/stackexchange-provider"
import { Adapter } from "next-auth/adapters"
import CredentialsProvider from "next-auth/providers/credentials"

// Wir verwenden die gleiche Konfiguration wie in auth.ts, aber erstellen eine eigene Handler-Instanz
const handler = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    StackExchangeProvider({
      clientId: "a30ae3b8-d708-4861-8fb6-9b188945d43b",
      clientSecret: "pck_ehvs68v3cpqp2acwhe268dbyn8msn5kxe9pq3gvk5h448",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("API Route - Attempting credentials authorization with:", { username: credentials?.username });
        
        // This is a simple demo auth - in production, you'd want to use a real authentication system
        if (credentials?.username === "demo" && credentials?.password === "demo") {
          console.log("API Route - Credentials login successful");
          const user = {
            id: "demo-user",
            name: "Demo User",
            email: "demo@example.com",
            image: null
          };

          // Create a demo user in prisma if it doesn't exist yet
          try {
            const existingUser = await prisma.user.findUnique({
              where: { email: user.email },
            });
            
            if (!existingUser) {
              console.log("API Route - Creating demo user in database");
              await prisma.user.create({
                data: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  image: user.image,
                }
              });
            }
          } catch (error) {
            console.error("API Route - Error handling user creation:", error);
            // Continue even if this fails - the JWT will still work
          }
          
          return user;
        }
        
        console.log("API Route - Credentials login failed");
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
      console.error(`API Route Error [${code}]:`, metadata)
    },
    warn(code) {
      console.warn(`API Route Warning [${code}]`)
    },
    debug(code, metadata) {
      console.log(`API Route Debug [${code}]:`, metadata)
    },
  },
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async session({ session, token }) {
      console.log("API Route - Session callback called with token:", token);
      if (session.user) {
        session.user.id = token.sub as string;
      }
      return session
    },
    async jwt({ token, user }) {
      console.log("API Route - JWT callback called with user:", user);
      if (user) {
        token.sub = user.id
      }
      return token
    },
    async redirect({ url, baseUrl }) {
      console.log("API Route - Redirect callback:", { url, baseUrl });
      // Make sure redirect always works properly
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl + "/chat";
    }
  }
})

export { handler as GET, handler as POST } 