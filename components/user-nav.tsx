"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { signOut } from "next-auth/react"
import { LogOut, Settings, User } from "lucide-react"
import { cn } from "../lib/utils"

export interface UserNavProps {
  isExpanded?: boolean
  user?: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function UserNav({ isExpanded = true, user }: UserNavProps) {
  const router = useRouter()
  
  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/login")
  }
  
  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : user?.email?.charAt(0)?.toUpperCase() || "U"

  // If not signed in, show login button
  if (!user) {
    return (
      <Button
        variant="ghost"
        className={cn("w-full justify-start gap-2", !isExpanded && "justify-center")}
        onClick={() => router.push("/login")}
        aria-label="Sign in"
      >
        <User className="h-4 w-4" aria-hidden="true" />
        {isExpanded && <span>Sign in</span>}
      </Button>
    )
  }

  return isExpanded ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="justify-end gap-2 px-3 py-2"
          aria-label="Open user menu"
          aria-haspopup="menu"
          aria-expanded="false"
        >
          <div className="flex flex-col items-start text-sm text-right mr-2">
            <span className="font-medium">{user.name || "User"}</span>
            <span className="text-xs text-muted-foreground truncate max-w-[120px]">
              {user.email}
            </span>
          </div>
          <Avatar className="h-6 w-6">
            <AvatarImage src={user.image || ""} alt={user.name || "User avatar"} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" aria-label="Profile">
            <User className="mr-2 h-4 w-4" aria-hidden="true" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" aria-label="Settings">
            <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} aria-label="Log out">
          <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Button
      variant="ghost"
      size="icon"
      className="w-full flex justify-center"
      onClick={() => router.push("/profile")}
      aria-label="Open user menu"
    >
      <Avatar className="h-6 w-6">
        <AvatarImage src={user.image || ""} alt={user.name || "User avatar"} />
        <AvatarFallback>{userInitials}</AvatarFallback>
      </Avatar>
    </Button>
  )
} 