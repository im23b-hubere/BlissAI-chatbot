import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

interface RouteParams {
  params: {
    chatId: string
  }
}

// Hilfsfunktion für die Authentifizierung auf Serverseite
async function getCurrentUser() {
  try {
    // Session ohne Parameter abrufen (verwendet automatisch die Route-Handler)
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return null;
    }
    
    // Benutzer aus der DB abrufen
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      }
    });

    if (!user) {
      // Für Demo-Zwecke: Wenn ein Benutzer eingeloggt ist, aber nicht in der DB vorhanden,
      // nehmen wir den Demo-Benutzer
      try {
        return await prisma.user.create({
          data: {
            id: "demo-user",
            name: "Demo User",
            email: "demo@example.com",
            hashedPassword: "demo"
          }
        });
      } catch (error) {
        // Wenn es bereits existiert, versuchen wir es abzurufen
        return await prisma.user.findUnique({
          where: { email: "demo@example.com" }
        });
      }
    }
    
    return user;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}

// Delete a specific chat
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { chatId } = params

    // Verify the chat belongs to the user
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
        userId: user.id,
      },
    })

    if (!chat) {
      return new NextResponse("Chat not found", { status: 404 })
    }

    // Delete all messages in the chat
    await prisma.message.deleteMany({
      where: {
        chatId,
      },
    })

    // Delete the chat
    await prisma.chat.delete({
      where: {
        id: chatId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[CHAT_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 