"use client"

import { useState } from "react"
import { UserNav } from "@/components/user-nav"
import { useSession } from "next-auth/react"
import { Sidebar } from "@/components/chat/sidebar"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { PanelLeft } from "lucide-react"

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen min-h-screen overflow-hidden">
      {/* Sidebar */}
      <div
        className={cn(
          "w-[300px] border-r bg-background transition-all duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-[300px] absolute z-50"
        )}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-h-0">
        <header className="border-b bg-background px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost" 
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
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