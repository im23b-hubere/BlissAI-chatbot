"use client";
import { LoginForm } from "@/components/login-form"
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background to-muted/50">
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        <Image
          src="/Logo_klein.JPG"
          alt="BlissAI Logo"
          width={180}
          height={180}
          className="mb-6 logo-img"
          style={{ mixBlendMode: "multiply" }}
          priority
        />
        <h1 className="text-2xl font-bold mb-2 text-center">Sign in to your account</h1>
        <p className="mb-6 text-center text-muted-foreground">Don't have an account? <a href="/sign-up" className="underline">Sign up</a></p>
        <LoginForm />
      </div>
    </div>
  )
} 