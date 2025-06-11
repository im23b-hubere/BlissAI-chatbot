"use client";
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background to-muted/50">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-2 text-center">Sign in to your account</h1>
        <p className="mb-6 text-center text-muted-foreground">Don't have an account? <a href="/sign-up" className="underline">Sign up</a></p>
        <LoginForm />
      </div>
    </div>
  )
} 