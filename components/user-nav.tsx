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
      >
        <User className="h-4 w-4" />
        {isExpanded && <span>Sign in</span>}
      </Button>
    )
  }

  return isExpanded ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={user.image || ""} alt={user.name || ""} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-sm">
            <span className="font-medium">{user.name || "User"}</span>
            <span className="text-xs text-muted-foreground truncate max-w-[120px]">
              {user.email}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
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
    >
      <Avatar className="h-6 w-6">
        <AvatarImage src={user.image || ""} alt={user.name || ""} />
        <AvatarFallback>{userInitials}</AvatarFallback>
      </Avatar>
    </Button>
  )
} 