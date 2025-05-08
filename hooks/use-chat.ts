import { useState, useCallback } from "react"
import { Message } from "@prisma/client"

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = useCallback(async (content: string) => {
    try {
      setIsLoading(true)

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        role: "user",
        userId: "current-user", // This will be replaced with actual user ID
        chatId: "current-chat", // This will be replaced with actual chat ID
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])

      // Send to API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: content }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const data = await response.json()

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        role: "assistant",
        userId: "current-user", // This will be replaced with actual user ID
        chatId: "current-chat", // This will be replaced with actual chat ID
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      // Handle error appropriately
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    messages,
    isLoading,
    sendMessage,
  }
} 