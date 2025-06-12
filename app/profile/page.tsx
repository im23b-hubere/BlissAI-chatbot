"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Lädt Profil...</div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-md">
          Nicht eingeloggt. <Button variant="link" onClick={() => router.push("/login")}>Zum Login</Button>
        </div>
      </div>
    );
  }

  const { name, email, image } = session.user;
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("")
    : email?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
      <div className="w-full max-w-md mx-auto bg-background/80 rounded-2xl shadow-xl p-8 flex flex-col items-center gap-6 border border-border">
        <Avatar className="h-20 w-20 shadow-md">
          <AvatarImage src={image || ""} alt={name || "User"} />
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-1">{name || "User"}</h1>
          <p className="text-muted-foreground text-sm">{email}</p>
        </div>
        <Button onClick={() => router.push("/chat")} className="mt-4 w-full">Zurück zum Chat</Button>
      </div>
    </div>
  );
} 