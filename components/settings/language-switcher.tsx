"use client";
import { useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

const LANGS = [
  { code: "de", label: "Deutsch" },
  { code: "en", label: "English" },
];

export function LanguageSwitcher({ onChange }: { onChange?: (lang: string) => void }) {
  const [lang, setLang] = useState("de");

  useEffect(() => {
    const stored = localStorage.getItem("lang");
    if (stored && LANGS.some(l => l.code === stored)) setLang(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem("lang", lang);
    onChange?.(lang);
  }, [lang, onChange]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          Sprache
          <Globe className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-full">
        {LANGS.map(l => (
          <DropdownMenuItem key={l.code} onClick={() => setLang(l.code)}>
            {l.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 