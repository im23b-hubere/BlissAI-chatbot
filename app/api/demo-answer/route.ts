import { NextRequest, NextResponse } from "next/server"
import { generateChatCompletion } from "@/lib/openai"

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json()
    if (!question) {
      return NextResponse.json({ error: "No question provided" }, { status: 400 })
    }
    const result = await generateChatCompletion([
      { role: "system", content: "You are a helpful AI assistant. Provide clear, concise, and accurate responses." },
      { role: "user", content: question }
    ])
    return NextResponse.json({ answer: result.content })
  } catch (e) {
    return NextResponse.json({ error: "AI error" }, { status: 500 })
  }
} 