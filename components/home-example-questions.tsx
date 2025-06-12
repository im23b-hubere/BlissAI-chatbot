"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export const EXAMPLES = [
  {
    key: "code",
    label: "Code",
    questions: [
      "Write code to invert a binary search tree in Python",
      "What's the difference between Promise.all and Promise.allSettled?",
      "Explain React's useEffect cleanup function",
      "Best practices for error handling in async/await",
    ],
  },
  {
    key: "explore",
    label: "Explore",
    questions: [
      "What are some hidden travel gems in Europe?",
      "Give me fun facts about the animal kingdom",
      "What are trending books or movies right now?",
      "Suggest unique hobbies to try this year",
    ],
  },
  {
    key: "create",
    label: "Create",
    questions: [
      "Write a short story about a time-traveling cat",
      "Help me plan a surprise birthday party",
      "Suggest creative dinner recipes with few ingredients",
      "Design a daily routine for more productivity",
    ],
  },
  {
    key: "learn",
    label: "Learn",
    questions: [
      "Explain the basics of mindfulness meditation",
      "How does the stock market work?",
      "What are effective ways to learn a new language?",
      "Teach me something interesting about space",
    ],
  },
]

// Wiederverwendbare Tabs+Buttons-Komponente
export function ExampleQuestionsTabs({ onExampleClick, loadingIdx, className }: {
  onExampleClick: (question: string, idx: number) => void,
  loadingIdx?: number | null,
  className?: string
}) {
  const [activeTab, setActiveTab] = useState(EXAMPLES[0].key)
  return (
    <div className={className || "w-full max-w-xl mx-auto animate-fade-in"}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 flex justify-center gap-2 bg-background/60 backdrop-blur rounded-2xl shadow-lg">
          {EXAMPLES.map((cat) => (
            <TabsTrigger
              key={cat.key}
              value={cat.key}
              className="data-[state=active]:bg-primary/90 data-[state=active]:text-primary-foreground rounded-xl px-5 py-2 text-base font-semibold transition-all"
            >
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {EXAMPLES.map((cat) => (
          <TabsContent key={cat.key} value={cat.key} className="flex flex-col gap-4">
            {cat.questions.map((q, idx) => (
              <Button
                key={q}
                variant="outline"
                className="justify-start w-full text-left px-6 py-4 rounded-2xl shadow-sm bg-background/80 hover:bg-accent/60 transition-all text-base font-medium flex items-center gap-3 focus-visible:ring-2 focus-visible:ring-primary"
                onClick={() => onExampleClick(q, idx)}
                disabled={loadingIdx === idx}
                tabIndex={0}
                aria-label={`Start chat: ${q}`}
              >
                {loadingIdx === idx ? (
                  <Loader2 className="animate-spin mr-2 h-5 w-5 text-primary" />
                ) : (
                  <span className="inline-block w-5 h-5 rounded-full bg-primary/10 mr-2" />
                )}
                {q}
              </Button>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

// Für die Startseite: eigene Handler-Logik
export function HomeExampleQuestions() {
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null)
  const router = useRouter()

  async function handleExampleClick(question: string, idx: number) {
    setLoadingIdx(idx)
    try {
      // 1. Neue Chat-Session anlegen
      const chatRes = await fetch("/api/chats", { method: "POST" })
      if (!chatRes.ok) throw new Error("Failed to create chat")
      const chatData = await chatRes.json()
      const chatId = chatData.chat.id
      // 2. Frage als erste Nachricht senden
      const msgRes = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: question }),
      })
      if (!msgRes.ok) throw new Error("Failed to send message")
      // 3. Redirect zum neuen Chat
      router.push(`/chat/${chatId}`)
    } catch (e) {
      alert("Etwas ist schiefgelaufen. Bitte versuche es erneut.")
    } finally {
      setLoadingIdx(null)
    }
  }

  return <ExampleQuestionsTabs onExampleClick={handleExampleClick} loadingIdx={loadingIdx} />
} 