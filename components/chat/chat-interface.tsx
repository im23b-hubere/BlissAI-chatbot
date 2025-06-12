"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Loader2, AlertCircle, PanelRightOpen, RotateCcw, Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import { Message } from "@/components/chat/message"
import { Message as MessageType } from "@prisma/client"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { ExampleQuestionsTabs } from "@/components/home-example-questions"

interface ChatInterfaceProps {
  chatId: string
}

export function ChatInterface({ chatId }: ChatInterfaceProps) {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<MessageType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()
  const [exampleLoadingIdx, setExampleLoadingIdx] = useState<number | null>(null)

  // Reset state when chatId changes
  useEffect(() => {
    setMessages([])
    setInitialLoading(true)
    setError(null)
    setRetryCount(0)
  }, [chatId])

  // Load chat messages when chatId changes
  useEffect(() => {
    async function loadMessages() {
      try {
        setInitialLoading(true)
        setError(null)
        
        const response = await fetch(`/api/chats/${chatId}/messages`)
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Chat not found")
          } else {
            throw new Error("Failed to load messages")
          }
        }
        
        const data = await response.json()
        setMessages(data.messages)
      } catch (error) {
        console.error("Error loading messages:", error)
        setError(error instanceof Error ? error.message : "Failed to load messages")
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load messages",
        })
      } finally {
        setInitialLoading(false)
      }
    }
    
    if (chatId) {
      loadMessages()
    }
  }, [chatId, toast, retryCount])

  // Focus input when component mounts
  useEffect(() => {
    if (!initialLoading && inputRef.current) {
      inputRef.current.focus()
    }
  }, [initialLoading])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async (content: string) => {
    try {
      setIsLoading(true)
      setError(null)

      // Add user message to state immediately for better UX
      const tempId = `temp-${Date.now()}`;
      const userMessage = {
        id: tempId,
        content,
        role: "user",
        userId: "",
        chatId,
        createdAt: new Date(),
      } as MessageType;
      setMessages((prev) => [...prev, userMessage])
      setInput("")

      // Send to API
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const data = await response.json()
      
      // Replace our temporary message with the real one from the server
      // and add the AI response
      setMessages((prev) => 
        [...prev.filter(m => m.id !== userMessage.id), data.userMessage, data.aiMessage]
      )
    } catch (error) {
      console.error("Error sending message:", error)
      setError(error instanceof Error ? error.message : "Failed to send message")
      toast({
        variant: "destructive",
        title: "Error sending message",
        description: error instanceof Error ? error.message : "Failed to send message",
      })
    } finally {
      setIsLoading(false)
      // Focus input after sending a message
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    await sendMessage(input.trim())
  }

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
  }

  // Handler für Beispiel-Fragen-Button im leeren Chat
  async function sendExampleMessage(question: string, idx: number) {
    setExampleLoadingIdx(idx)
    try {
      await sendMessage(question)
    } finally {
      setExampleLoadingIdx(null)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="relative">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <motion.div 
              className="absolute inset-0 rounded-full bg-primary/10"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <p className="text-sm text-muted-foreground">Loading conversation...</p>
        </motion.div>
      </div>
    )
  }

  if (error && messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-3 text-center max-w-md mx-auto bg-card p-6 rounded-lg shadow-sm"
        >
          <AlertCircle className="h-8 w-8 text-destructive" />
          <h3 className="text-lg font-medium">Something went wrong</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4 gap-2 transition-all duration-300"
            onClick={handleRetry}
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-h-screen w-full">
      <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
        <div className="space-y-4 max-w-3xl mx-auto">
          <AnimatePresence initial={false}>
            {messages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex h-full flex-col items-center justify-center text-center p-10 my-16"
              >
                <div className="relative mb-4">
                  <Bot className="h-12 w-12 text-primary" />
                  <motion.div 
                    className="absolute inset-0 rounded-full bg-primary/10"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.8, opacity: 0 }}
                    transition={{ duration: 3, repeat: Infinity, repeatType: "loop" }}
                  />
                </div>
                <h3 className="text-xl font-bold mb-2">Start a conversation</h3>
                <p className="text-muted-foreground max-w-sm">
                  Send a message to start chatting with BlissAI. Ask questions, get creative, or just say hello!
                </p>
                <ExampleQuestionsTabs
                  onExampleClick={sendExampleMessage}
                  loadingIdx={exampleLoadingIdx}
                  className="mt-8"
                />
              </motion.div>
            ) : (
              messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Message message={message} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 text-muted-foreground bg-muted/50 p-3 rounded-lg"
            >
              <div className="relative">
                <Loader2 className="h-4 w-4 animate-spin" />
                <motion.div 
                  className="absolute inset-0 rounded-full bg-primary/10"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
              <span>BlissAI is thinking...</span>
            </motion.div>
          )}
          {error && !initialLoading && messages.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 rounded-md bg-destructive/10 text-destructive flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <div className="flex-1">{error}</div>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-7 px-2 text-xs"
                onClick={handleRetry}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </motion.div>
          )}
        </div>
      </div>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="border-t p-4 bg-background/80 backdrop-blur-sm w-full"
      >
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="relative flex space-x-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-background pl-4 pr-10 py-6 shadow-sm transition-all duration-200 focus-visible:ring-2"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon"
              className="transition-all duration-300 hover:scale-105"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            className="text-xs text-center text-muted-foreground mt-2"
          >
            Powered by BlissAI | Responses may take a moment
          </motion.p>
        </form>
      </motion.div>
    </div>
  )
} 