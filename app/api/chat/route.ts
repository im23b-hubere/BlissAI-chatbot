import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { OpenAI } from "openai"
import { NextResponse } from "next/server"

// Typ für OpenAI ChatCompletionMessageParam direkt definieren
// (statt Import, da der Import Fehler verursacht)
type ChatCompletionMessageParam = {
  role: "user" | "assistant" | "system"
  content: string
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { message } = await req.json()
    if (!message) {
      return new NextResponse("Message is required", { status: 400 })
    }

    // Get or create chat
    let chat = await prisma.chat.findFirst({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          title: "New Chat",
          userId: session.user.id,
        },
      })
    }

    // Save user message
    await prisma.message.create({
      data: {
        content: message,
        role: "user",
        userId: session.user.id,
        chatId: chat.id,
      },
    })

    // Get chat history
    const messages = await prisma.message.findMany({
      where: {
        chatId: chat.id,
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
    await prisma.message.create({
      data: {
        content: aiResponse,
        role: "assistant",
        userId: session.user.id,
        chatId: chat.id,
      },
    })

    return NextResponse.json({ message: aiResponse })
  } catch (error) {
    console.error("[CHAT_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 