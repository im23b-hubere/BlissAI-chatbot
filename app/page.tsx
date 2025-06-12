"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { HomeExampleQuestions } from "@/components/home-example-questions"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/chat")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-background">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight">Willkommen bei BlissAI</h1>
          <p className="text-lg text-muted-foreground font-medium">Wähle eine Kategorie und starte direkt mit einer Beispiel-Frage!</p>
        </div>
        <HomeExampleQuestions />
      </main>
    )
  }

  // Fallback (z.B. falls status nicht erkannt)
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  )
} 