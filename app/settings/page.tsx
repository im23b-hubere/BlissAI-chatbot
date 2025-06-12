"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/settings/theme-switcher";
import { LanguageSwitcher } from "@/components/settings/language-switcher";
import { PasswordChangeModal } from "@/components/settings/password-modal";
import { useState } from "react";

type Lang = 'de' | 'en';
const translations: Record<Lang, { [key: string]: string }> = {
  de: {
    settings: "Einstellungen",
    manage: "Verwalte deine Kontoeinstellungen",
    name: "Name:",
    email: "E-Mail:",
    theme: "Theme",
    language: "Sprache",
    password: "Passwort ändern",
    changePassword: "Passwort ändern",
    back: "Zurück zum Chat",
    notLoggedIn: "Nicht eingeloggt.",
    toLogin: "Zum Login",
    loading: "Lädt Einstellungen..."
  },
  en: {
    settings: "Settings",
    manage: "Manage your account settings",
    name: "Name:",
    email: "Email:",
    theme: "Theme",
    language: "Language",
    password: "Change password",
    changePassword: "Change password",
    back: "Back to chat",
    notLoggedIn: "Not logged in.",
    toLogin: "To login",
    loading: "Loading settings..."
  }
};

function getLang(): Lang {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("lang");
    if (stored === "en" || stored === "de") return stored;
  }
  return "de";
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pwModal, setPwModal] = useState(false);
  const lang: Lang = typeof window !== "undefined" ? getLang() : "de";
  const t = translations[lang];

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">{t.loading}</div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-md">
          {t.notLoggedIn} <Button variant="link" onClick={() => router.push("/login")}>{t.toLogin}</Button>
        </div>
      </div>
    );
  }

  const { name, email } = session.user;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
      <div className="w-full max-w-md mx-auto bg-background/80 rounded-2xl shadow-xl p-8 flex flex-col gap-6 border border-border">
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-1">{t.settings}</h1>
          <p className="text-muted-foreground text-sm">{t.manage}</p>
        </div>
        <div className="space-y-2">
          <div>
            <span className="font-medium">{t.name}</span> {name || "User"}
          </div>
          <div>
            <span className="font-medium">{t.email}</span> {email}
          </div>
        </div>
        <div className="mt-6 space-y-4">
          <div className="bg-muted/40 rounded-lg p-4 flex flex-col gap-2">
            <span className="font-semibold">{t.theme}</span>
            <ThemeSwitcher />
          </div>
          <div className="bg-muted/40 rounded-lg p-4 flex flex-col gap-2">
            <span className="font-semibold">{t.language}</span>
            <LanguageSwitcher />
          </div>
          <div className="bg-muted/40 rounded-lg p-4 flex flex-col gap-2">
            <span className="font-semibold">{t.password}</span>
            <Button variant="outline" onClick={() => setPwModal(true)} className="w-fit">{t.changePassword}</Button>
            <PasswordChangeModal open={pwModal} onOpenChange={setPwModal} />
          </div>
        </div>
        <Button onClick={() => router.push("/chat")} className="mt-4 w-full">{t.back}</Button>
      </div>
    </div>
  );
} 