import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/db"
import { OpenAI } from "openai"
import { NextResponse } from "next/server"

// Typ für OpenAI ChatCompletionMessageParam direkt definieren
type ChatCompletionMessageParam = {
  role: "user" | "assistant" | "system"
  content: string
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface RouteParams {
  params: {
    chatId: string
  }
}

// Hilfsfunktion für die Authentifizierung auf Serverseite
async function getCurrentUser() {
  try {
    // Direkt Session abrufen ohne Parameter
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return null;
    }
    
    // Demo-Benutzer aus der DB abrufen
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
            email: "demo@example.com"
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

// Get all messages for a specific chat
export async function GET(req: Request, { params }: RouteParams) {
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

    // Get all messages for the chat
    const messages = await prisma.message.findMany({
      where: {
        chatId,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("[MESSAGES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// Create a new message in a chat
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { chatId } = params
    const { content } = await req.json()

    if (!content) {
      return new NextResponse("Content is required", { status: 400 })
    }

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

    // Update chat title if it's a new chat
    if (chat.title === "New Chat") {
      await prisma.chat.update({
        where: { id: chatId },
        data: {
          title: content.length > 30 ? `${content.substring(0, 30)}...` : content,
        },
      })
    }

    // Create user message
    const userMessage = await prisma.message.create({
      data: {
        content,
        role: "user",
        userId: user.id,
        chatId,
      },
    })

    // Get chat history
    const messages = await prisma.message.findMany({
      where: {
        chatId,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    // Format messages for OpenAI
    const formattedMessages: ChatCompletionMessageParam[] = messages.map((msg) => ({
      role: msg.role as "user" | "assistant" | "system",
      content: msg.content,
    }))

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant. Provide clear, concise, and accurate responses.",
        },
        ...formattedMessages,
      ],
    })

    const aiResponse = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response."

    // Save AI response
    const aiMessage = await prisma.message.create({
      data: {
        content: aiResponse,
        role: "assistant",
        userId: user.id,
        chatId,
      },
    })

    // Update the chat's updatedAt time
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({ userMessage, aiMessage })
  } catch (error) {
    console.error("[MESSAGES_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 