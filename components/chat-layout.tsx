"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Chat } from "@prisma/client"
import { useState, useEffect, useRef } from "react"
import { ChatUI } from "./chat-ui"
import { Button } from "./ui/button"
import { cn } from "../lib/utils"
import { UserNav } from "./user-nav"
import { PlusIcon, MessageSquare } from "lucide-react"

type ChatWithFirstMessage = Chat & {
  messages: {
    id: string
    content: string
    role: string
    createdAt: Date
  }[]
}

interface ChatLayoutProps {
  chats: ChatWithFirstMessage[]
}

export function ChatLayout({ chats: initialChats }: ChatLayoutProps) {
  const router = useRouter()
  const params = useParams()
  const [open, setOpen] = useState(true)
  const [chats, setChats] = useState(initialChats)
  
  // Get the current chat ID from the URL
  const chatId = typeof params?.id === "string" ? params.id : undefined
  
  const createNewChat = async () => {
    router.push("/chat/new")
  }
  
  const toggleSidebar = () => {
    setOpen(!open)
  }
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric"
    }).format(new Date(date))
  }

  const sidebarRef = useRef<HTMLDivElement>(null)

  // Close sidebar on outside click (mobile)
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (window.innerWidth < 768) {
      document.addEventListener("mousedown", handleClick)
      return () => document.removeEventListener("mousedown", handleClick)
    }
  }, [open])

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar als Drawer auf Mobile */}
      <nav
        ref={sidebarRef}
        className={cn(
          "bg-muted/40 fixed z-30 inset-y-0 left-0 w-64 border-r transition-transform flex flex-col md:relative md:translate-x-0 md:w-64 md:block",
          open
            ? "translate-x-0 shadow-xl"
            : "-translate-x-full md:translate-x-0 md:block",
          "duration-300 ease-in-out"
        )}
        aria-label="Main navigation"
      >
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <Link href="/" className={cn("flex items-center gap-2", !open && "md:hidden")}>
            <span className="text-xl font-bold">BlissAI</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleSidebar}
            aria-label={open ? "Close sidebar" : "Open sidebar"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Button>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <div className="px-4 py-2">
            <Button
              onClick={createNewChat}
              variant="outline"
              className={cn("w-full justify-start gap-2", !open && "md:justify-center md:px-2")}
              aria-label="Start new chat"
            >
              <PlusIcon className="h-4 w-4" />
              <span className={cn("", !open && "md:hidden")}>New Chat</span>
            </Button>
          </div>
          <div className="grid gap-1 px-2 group">
            {chats.map((chat) => (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                  chatId === chat.id ? "bg-accent" : "transparent",
                  !open && "md:justify-center md:px-2"
                )}
                aria-current={chatId === chat.id ? "page" : undefined}
              >
                <MessageSquare className="h-4 w-4" />
                {open && (
                  <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                    <span className="font-medium">{chat.title}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDate(chat.updatedAt)}</span>
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-auto p-4 border-t">
          <UserNav isExpanded={open} />
        </div>
      </nav>
      {/* Overlay für Drawer auf Mobile */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}
      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-0">
        <header className="h-14 flex items-center px-2 sm:px-4 border-b gap-2 justify-between bg-background/95 backdrop-blur-sm sticky top-0 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleSidebar}
            aria-label={open ? "Close sidebar" : "Open sidebar"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </svg>
          </Button>
          <div className="md:hidden flex-1 truncate">
            <span className="font-medium truncate">
              {chatId
                ? chats.find((chat) => chat.id === chatId)?.title || "Chat"
                : "New Chat"}
            </span>
          </div>
          <div className="hidden md:flex md:flex-1" />
        </header>
        <main className="flex-1 overflow-auto min-h-0">
          <ChatUI chatId={chatId} />
        </main>
      </div>
    </div>
  )
} 