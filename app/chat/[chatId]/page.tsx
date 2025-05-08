"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Suspense, useEffect } from "react"
import { ChatInterface } from "@/components/chat/chat-interface"
import { Loader2 } from "lucide-react"

interface ChatPageProps {
  params: {
    chatId: string
  }
}

function ChatPageContent({ chatId }: { chatId: string }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // If still loading, show loading state
  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <main className="flex h-screen flex-col">
      <div className="flex-1 overflow-hidden">
        <ChatInterface chatId={chatId} />
      </div>
    </main>
  )
}

export default function ChatPage({ params }: ChatPageProps) {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    }>
      <ChatPageContent chatId={params.chatId} />
    </Suspense>
  )
} 