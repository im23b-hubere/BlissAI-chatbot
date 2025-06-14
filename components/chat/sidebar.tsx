"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlusCircle, MessageCircle, Loader2, Trash } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ToastAction } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

interface Chat {
  id: string
  title: string
  updatedAt: Date
}

interface SidebarProps {
  onChatSelect?: () => void
}

export function Sidebar({ onChatSelect }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [chatToDelete, setChatToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  // Get chatId from URL
  useEffect(() => {
    // Extract chatId from the pathname
    const pathParts = pathname.split('/')
    const chatIdFromPath = pathParts.length > 2 ? pathParts[2] : null
    
    if (chatIdFromPath) {
      setSelectedChat(chatIdFromPath)
    }
  }, [pathname])

  // Fetch chats on component mount
  useEffect(() => {
    async function fetchChats() {
      try {
        const response = await fetch("/api/chats")
        if (!response.ok) throw new Error("Failed to fetch chats")
        const data = await response.json()
        setChats(data.chats)
        
        // If there are chats and no chat is selected, select the most recent one
        if (data.chats.length > 0 && !selectedChat) {
          setSelectedChat(data.chats[0].id)
        }
      } catch (error) {
        console.error("Error fetching chats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchChats()
  }, [selectedChat])

  const createNewChat = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) throw new Error("Failed to create new chat")
      
      const data = await response.json()
      setChats((prev) => [data.chat, ...prev])
      setSelectedChat(data.chat.id)
      router.push(`/chat/${data.chat.id}`)
      if (onChatSelect) onChatSelect()
    } catch (error) {
      console.error("Error creating new chat:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not create new chat. Please try again.",
      })
    } finally {
      setLoading(false);
    }
  }

  const selectChat = (chatId: string) => {
    setSelectedChat(chatId)
    router.push(`/chat/${chatId}`)
    if (onChatSelect) onChatSelect()
  }

  const deleteChat = async (chatId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chats/${chatId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete chat")
      
      // Remove chat from state
      setChats((prev) => prev.filter((chat) => chat.id !== chatId))
      
      // If the deleted chat was selected, select the next one or redirect to create a new chat
      if (selectedChat === chatId) {
        const remainingChats = chats.filter((chat) => chat.id !== chatId)
        if (remainingChats.length > 0) {
          selectChat(remainingChats[0].id)
        } else {
          createNewChat()
        }
      }

      toast({
        title: "Chat deleted",
        description: "Your chat has been permanently deleted.",
        action: <ToastAction altText="OK">OK</ToastAction>,
      })
    } catch (error) {
      console.error("Error deleting chat:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete chat. Please try again.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      })
    } finally {
      setChatToDelete(null)
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-semibold">Chats</h2>
        <Button 
          onClick={createNewChat} 
          variant="outline" 
          size="sm" 
          className="gap-1"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <PlusCircle className="h-4 w-4" />
          )}
          <span>New Chat</span>
        </Button>
      </div>
      
      <ScrollArea className="flex-1 px-2">
        {loading && chats.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-muted-foreground">
            <MessageCircle className="h-8 w-8" />
            <p>No chats yet</p>
            <p className="text-sm">Start a new conversation</p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-2 py-2">
              {chats.map((chat) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="group relative"
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left",
                      selectedChat === chat.id && "bg-accent"
                    )}
                    onClick={() => selectChat(chat.id)}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    <span className="truncate">{chat.title}</span>
                  </Button>
                  
                  <AlertDialog open={chatToDelete === chat.id} onOpenChange={(open: boolean) => !open && setChatToDelete(null)}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation()
                          setChatToDelete(chat.id)
                        }}
                      >
                        <Trash className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete chat</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this chat? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e: React.MouseEvent) => {
                            e.preventDefault()
                            deleteChat(chat.id)
                          }}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </ScrollArea>
    </div>
  )
} 