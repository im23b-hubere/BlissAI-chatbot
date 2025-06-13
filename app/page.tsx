"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { HomeExampleQuestions } from "@/components/home-example-questions"
import Link from "next/link"
import Image from "next/image"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Copy, CheckCheck } from "lucide-react"
import { useState as useCopyState } from "react"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  // Für Demo-Antworten
  const [demoAnswer, setDemoAnswer] = useState<string | null>(null)
  const [demoLoading, setDemoLoading] = useState(false)
  const [demoError, setDemoError] = useState("")

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
      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-gradient-to-br from-background to-muted/50">
        {/* Top Nav */}
        <div className="absolute top-0 right-0 p-6 flex gap-4 z-10">
          <Link href="/login" className="font-semibold px-4 py-2 rounded-xl bg-background/80 shadow hover:bg-accent/60 transition-all border border-border">Login</Link>
          <Link href="/sign-up" className="font-semibold px-4 py-2 rounded-xl bg-primary text-primary-foreground shadow hover:bg-primary/90 transition-all">Sign Up</Link>
        </div>
        {/* Logo */}
        <Image src="/Logo_klein.svg" alt="BlissAI Logo" width={90} height={90} className="mb-6 logo-img" />
        {/* Main Content (no card) */}
        <div className="w-full max-w-2xl flex flex-col items-center animate-fade-in pb-12">
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight">Willkommen bei BlissAI</h1>
            <p className="text-lg text-muted-foreground font-medium">Wähle eine Kategorie und teste BlissAI direkt mit einer Beispiel-Frage!</p>
          </div>
          <HomeExampleQuestions 
            onDemoAnswer={async (question: string) => {
              setDemoAnswer(null)
              setDemoError("")
              setDemoLoading(true)
              try {
                const res = await fetch("/api/demo-answer", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ question })
                })
                if (!res.ok) throw new Error("Fehler beim Abrufen der AI-Antwort.")
                const data = await res.json()
                setDemoAnswer(data.answer)
              } catch (e) {
                setDemoError("Fehler beim Abrufen der AI-Antwort.")
              } finally {
                setDemoLoading(false)
              }
            }}
            demoLoading={demoLoading}
          />
          {/* Demo-Antwort anzeigen */}
          {demoLoading && (
            <div className="mt-16 w-full flex justify-center animate-pulse text-muted-foreground">BlissAI denkt ...</div>
          )}
          {demoError && (
            <div className="mt-8 w-full bg-destructive/10 text-destructive text-center p-4 rounded-xl">{demoError}</div>
          )}
          {demoAnswer && !demoLoading && (
            <DemoAnswerCard answer={demoAnswer} />
          )}
        </div>
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

// Demo-Antwort Card-Komponente mit Markdown/Code-Block-Rendering und Copy-Button
function DemoAnswerCard({ answer }: { answer: string }) {
  const [isCopied, setIsCopied] = useCopyState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(answer)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }
  return (
    <div className="mt-8 w-full max-w-xl mx-auto bg-background/90 rounded-2xl shadow-lg p-6 animate-fade-in relative">
      <button
        className="absolute top-4 right-4 p-2 rounded-lg bg-muted hover:bg-accent transition-colors"
        onClick={handleCopy}
        aria-label="Antwort kopieren"
      >
        {isCopied ? <CheckCheck className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
      </button>
      <div className="prose prose-neutral dark:prose-invert max-w-full">
        <ReactMarkdown
          components={{
            code({ className, children, ...props }: { className?: string; children?: React.ReactNode }) {
              const match = /language-(\w+)/.exec(className || "")
              return match ? (
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{ borderRadius: "1rem", fontSize: "0.95em", boxShadow: "0 2px 16px rgba(0,0,0,0.04)", margin: "0.5rem 0" }}
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code style={{ background: "#f4f4f4", borderRadius: "6px", padding: "2px 6px", fontSize: "0.95em" }} {...props}>
                  {children}
                </code>
              )
            }
          }}
        >
          {answer}
        </ReactMarkdown>
      </div>
    </div>
  )
} 