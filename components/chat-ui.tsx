"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { cn } from "../lib/utils"
import { Message } from "@prisma/client"
import { AnimatePresence, motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism"
import { SendIcon, User, Bot } from "lucide-react"
import type { ReactMarkdownProps } from "react-markdown/lib/complex-types"

// Define a type for code component props to avoid the 'inline' error
type CodeComponentProps = {
  node?: any
  inline?: boolean
  className?: string
  children: React.ReactNode
  [key: string]: any
}

interface ChatUIProps {
  chatId?: string
}

export function ChatUI({ chatId }: ChatUIProps) {
  const router = useRouter()
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [initialLoad, setInitialLoad] = useState(true)
  
  // Fetch existing messages if a chatId is provided
  useEffect(() => {
    if (chatId && chatId !== "new") {
      fetchMessages()
    } else {
      setMessages([])
      setInitialLoad(false)
    }
  }, [chatId])
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])
  
  // Auto-focus input on load
  useEffect(() => {
    if (inputRef.current && !initialLoad) {
      inputRef.current.focus()
    }
  }, [initialLoad])
  
  const fetchMessages = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/chats/${chatId}`)
      
      if (!res.ok) {
        throw new Error("Failed to fetch messages")
      }
      
      const data = await res.json()
      setMessages(data.chat.messages)
      setInitialLoad(false)
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() || isLoading) return
    
    // Optimistically add user message to UI
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      content: input,
      role: "user",
      createdAt: new Date(),
      userId: "",
      chatId: chatId || "",
    }
    
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            { role: "user", content: input },
          ],
          chatId,
        }),
      })
      
      if (!res.ok) {
        throw new Error("Failed to send message")
      }
      
      const data = await res.json()
      
      // Update messages with the response
      setMessages((prev) => [
        ...prev.filter((msg) => msg.id !== userMessage.id),
        {
          id: userMessage.id,
          content: userMessage.content,
          role: "user",
          createdAt: new Date(),
          userId: "",
          chatId: data.chatId,
        },
        data.message,
      ])
      
      // If this was a new chat, redirect to the created chat
      if (!chatId || chatId === "new") {
        router.push(`/chat/${data.chatId}`)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      // Remove the optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id))
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex-1 overflow-y-auto p-4 space-y-6"
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        aria-label="Chat messages"
      >
        {initialLoad ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-muted-foreground">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="size-10 text-primary" aria-hidden="true" />
            </div>
            <div className="space-y-2 max-w-md">
              <h3 className="text-xl font-bold">How can I help you today?</h3>
              <p className="text-muted-foreground">
                Ask me anything - from simple questions to complex problems. I'm here to assist with information, creative ideas, and solutions.
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-lg",
                  message.role === "user" ? "bg-primary/10" : "bg-muted"
                )}
                aria-label={message.role === "user" ? "User message" : "AI message"}
              >
                <div className={cn(
                  "size-8 rounded-full flex items-center justify-center",
                  message.role === "user" ? "bg-primary" : "bg-secondary"
                )}>
                  {message.role === "user" ? (
                    <User className="size-4 text-primary-foreground" aria-hidden="true" />
                  ) : (
                    <Bot className="size-4 text-secondary-foreground" aria-hidden="true" />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <p className="font-medium text-sm">
                    {message.role === "user" ? "You" : "BlissAI"}
                  </p>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        code: ({ node, inline, className, children, ...props }: CodeComponentProps) => {
                          const match = /language-(\w+)/.exec(className || "")
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          )
                        },
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2" aria-label="Send a message">
          <Textarea
            ref={inputRef}
            placeholder="Type your message here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-10 max-h-40 resize-none"
            disabled={isLoading}
            aria-label="Message input"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
          >
            <SendIcon className="size-4" aria-hidden="true" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
        {isLoading && (
          <div className="text-xs text-muted-foreground animate-pulse pt-2" aria-live="polite">
            BlissAI is thinking...
          </div>
        )}
      </div>
    </div>
  )
} 