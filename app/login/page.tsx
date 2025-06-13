"use client";
import { LoginForm } from "@/components/login-form"
import Image from "next/image";
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background to-muted/50">
      {/* Back Button */}
      <Link href="/" className="absolute top-6 left-6 z-10 bg-background/80 rounded-full shadow p-2 hover:bg-accent transition-colors" aria-label="Zurück zur Startseite">
        <ArrowLeft className="h-6 w-6" />
      </Link>
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        <img
          src="/Logo_klein.svg"
          alt="BlissAI Logo"
          width={180}
          height={180}
          className="mb-6 logo-img"
        />
        <h1 className="text-2xl font-bold mb-2 text-center">Sign in to your account</h1>
        <p className="mb-6 text-center text-muted-foreground">Don't have an account? <a href="/sign-up" className="underline">Sign up</a></p>
        <LoginForm />
      </div>
    </div>
  )
} 