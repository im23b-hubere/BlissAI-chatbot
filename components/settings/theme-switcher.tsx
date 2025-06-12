"use client";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sun, Moon, Laptop } from "lucide-react";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          Theme
          {theme === "light" && <Sun className="ml-2 h-4 w-4" />}
          {theme === "dark" && <Moon className="ml-2 h-4 w-4" />}
          {theme === "system" && <Laptop className="ml-2 h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>🌞 Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>🌙 Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>💻 System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 