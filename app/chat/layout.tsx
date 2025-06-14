"use client"

import { useState, useEffect, useCallback } from "react"
import { UserNav } from "@/components/user-nav"
import { useSession } from "next-auth/react"
import { Sidebar } from "@/components/chat/sidebar"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { PanelLeft } from "lucide-react"

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  // Responsive: Sidebar auf Mobile standardmäßig geschlossen, auf Desktop offen
  const getInitialSidebarOpen = () => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768 // md breakpoint
    }
    return true
  }
  const [sidebarOpen, setSidebarOpen] = useState(getInitialSidebarOpen)

  // Handle window resize: Sidebar auf Desktop immer offen, auf Mobile standardmäßig zu
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Callback für Sidebar: schließt Sidebar auf Mobile nach Chat-Auswahl
  const handleChatSelect = useCallback(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [])

  return (
    <div className="flex h-screen min-h-screen overflow-hidden">
      {/* Sidebar */}
      <div
        className={cn(
          "w-[300px] border-r bg-background transition-all duration-300 ease-in-out md:relative md:translate-x-0 md:z-0",
          sidebarOpen
            ? "translate-x-0 z-50 fixed md:static"
            : "-translate-x-[300px] absolute z-50 md:translate-x-0 md:static",
          "h-full"
        )}
        style={{ top: 0, left: 0 }}
      >
        <Sidebar onChatSelect={handleChatSelect} />
      </div>
      {/* Overlay für Mobile, wenn Sidebar offen */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}
      {/* Main content */}
      <div className="flex flex-1 flex-col min-h-0">
        <header className="border-b bg-background px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              className="md:hidden"
            >
              <PanelLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Chat</h1>
          </div>
          {session?.user && <UserNav user={session.user} />}
        </header>
        <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
      </div>
    </div>
  )
} 