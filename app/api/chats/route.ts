import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// Hilfsfunktion für die Authentifizierung auf Serverseite
async function getCurrentUser() {
  try {
    // Session ohne Parameter abrufen (verwendet automatisch die Route-Handler)
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      console.log("No session or email found");
      return null;
    }
    
    console.log("Session found for email:", session.user.email);
    
    // Benutzer aus der DB abrufen
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      }
    });

    if (!user) {
      console.log("User not found in DB, creating demo user");
      // Für Demo-Zwecke: Wenn ein Benutzer eingeloggt ist, aber nicht in der DB vorhanden,
      // erstellen wir den Demo-Benutzer
      try {
        return await prisma.user.create({
          data: {
            id: "demo-user",
            name: "Demo User",
            email: "demo@example.com"
          }
        });
      } catch (error) {
        console.log("Error creating user, trying to find existing demo user");
        // Wenn es bereits existiert, versuchen wir es abzurufen
        return await prisma.user.findUnique({
          where: { email: "demo@example.com" }
        });
      }
    }
    
    console.log("Found user:", user.id);
    return user;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}

// GET handler to fetch all chats for the user
export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      console.log("GET /api/chats - Unauthorized");
      return new NextResponse("Unauthorized", { status: 401 })
    }

    console.log("Fetching chats for user:", user.id);
    
    const chats = await prisma.chat.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json({ chats })
  } catch (error) {
    console.error("[CHATS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// POST handler to create a new chat
export async function POST() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      console.log("POST /api/chats - Unauthorized");
      return new NextResponse("Unauthorized", { status: 401 })
    }

    console.log("Creating new chat for user:", user.id);
    
    const chat = await prisma.chat.create({
      data: {
        title: "New Chat",
        userId: user.id,
      },
    })

    return NextResponse.json({ chat })
  } catch (error) {
    console.error("[CHATS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 