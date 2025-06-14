"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

function ChatPageContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }
    if (status === "authenticated") {
      // Nach Login: Chats abfragen
      const fetchChatsAndRedirect = async () => {
        try {
          const res = await fetch("/api/chats")
          if (!res.ok) throw new Error("Failed to fetch chats")
          const data = await res.json()
          if (data.chats && data.chats.length > 0) {
            // Redirect zum neuesten Chat
            router.replace(`/chat/${data.chats[0].id}`)
          } else {
            // Neuen Chat anlegen und weiterleiten
            const chatRes = await fetch("/api/chats", { method: "POST" })
            if (!chatRes.ok) throw new Error("Failed to create chat")
            const chatData = await chatRes.json()
            router.replace(`/chat/${chatData.chat.id}`)
          }
        } catch (e) {
          // Fehleranzeige
          setLoading(false)
        }
      }
      fetchChatsAndRedirect()
    }
  }, [status, router])

  if (status === "loading" || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Redirecting to chat...</p>
        </div>
      </div>
    )
  }

  // Fehlerfall: Anzeige für den User
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-md">
        Fehler beim Laden oder Erstellen des Chats. Bitte lade die Seite neu.
      </div>
    </div>
  )
}

export default function ChatPage() {
  return <ChatPageContent />
} 