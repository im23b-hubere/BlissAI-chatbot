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

// Get all messages for a specific chat
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      console.log("GET /api/chats/[chatId]/messages - Unauthorized");
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { chatId } = params

    console.log(`Fetching messages for chat ${chatId}, user ${user.id}`);

    // Verify the chat belongs to the user
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
        userId: user.id,
      },
    })

    if (!chat) {
      console.log(`Chat ${chatId} not found for user ${user.id}`);
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

    console.log(`Found ${messages.length} messages for chat ${chatId}`);
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
      console.log("POST /api/chats/[chatId]/messages - Unauthorized");
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { chatId } = params
    const body = await req.json();
    const { content } = body;

    if (!content) {
      console.log("POST /api/chats/[chatId]/messages - No content provided");
      return new NextResponse("Content is required", { status: 400 })
    }

    console.log(`Creating new message in chat ${chatId} for user ${user.id}`);

    // Verify the chat belongs to the user
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
        userId: user.id,
      },
    })

    if (!chat) {
      console.log(`Chat ${chatId} not found for user ${user.id}`);
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

    console.log(`User message created: ${userMessage.id}`);

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

    console.log(`Sending ${formattedMessages.length} messages to OpenAI`);

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
    console.log(`Received AI response of ${aiResponse.length} characters`);

    // Save AI response
    const aiMessage = await prisma.message.create({
      data: {
        content: aiResponse,
        role: "assistant",
        userId: user.id,
        chatId,
      },
    })

    console.log(`AI message created: ${aiMessage.id}`);

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