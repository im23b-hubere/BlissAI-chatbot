"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/settings/theme-switcher";
import { PasswordChangeModal } from "@/components/settings/password-modal";
import { useState } from "react";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pwModal, setPwModal] = useState(false);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading settings...</div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-md">
          Not logged in. <Button variant="link" onClick={() => router.push("/login")}>To login</Button>
        </div>
      </div>
    );
  }

  const { name, email } = session.user;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
      <div className="w-full max-w-md mx-auto bg-background/80 rounded-2xl shadow-xl p-8 flex flex-col gap-6 border border-border">
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-1">Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your account settings</p>
        </div>
        <div className="space-y-2">
          <div>
            <span className="font-medium">Name:</span> {name || "User"}
          </div>
          <div>
            <span className="font-medium">Email:</span> {email}
          </div>
        </div>
        <div className="mt-6 space-y-4">
          <div className="bg-muted/40 rounded-lg p-4 flex flex-col gap-2">
            <span className="font-semibold">Theme</span>
            <ThemeSwitcher />
          </div>
          <div className="bg-muted/40 rounded-lg p-4 flex flex-col gap-2">
            <span className="font-semibold">Change password</span>
            <Button variant="outline" onClick={() => setPwModal(true)} className="w-fit">Change password</Button>
            <PasswordChangeModal open={pwModal} onOpenChange={setPwModal} />
          </div>
        </div>
        <Button onClick={() => router.push("/chat")} className="mt-4 w-full">Back to chat</Button>
      </div>
    </div>
  );
} 