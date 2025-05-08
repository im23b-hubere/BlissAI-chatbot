"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Suspense, useEffect } from "react"
import { Loader2 } from "lucide-react"

function ChatPageContent() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // If we're on the base chat page, check if we need to create a new chat or redirect to the most recent one
  useEffect(() => {
    if (status === "authenticated") {
      // Fetch the most recent chat or create a new one
      fetch("/api/chats")
        .then((res) => res.json())
        .then((data) => {
          if (data.chats && data.chats.length > 0) {
            // Redirect to the most recent chat
            router.push(`/chat/${data.chats[0].id}`)
          } else {
            // Create a new chat
            fetch("/api/chats", { method: "POST" })
              .then((res) => res.json())
              .then((data) => {
                router.push(`/chat/${data.chat.id}`)
              })
          }
        })
    }
  }, [router, status])

  // If still loading, show loading state
  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecting to chat...</p>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  )
} 