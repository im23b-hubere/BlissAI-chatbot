"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SignUpPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ name: "", email: "", password: "" })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    // Hier später Backend-Logik ergänzen
    setTimeout(() => {
      setIsLoading(false)
      router.push("/login")
    }, 1200)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background to-muted/50">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-2 text-center">Create your account</h1>
        <p className="mb-6 text-center text-muted-foreground">Already have an account? <a href="/login" className="underline">Sign in</a></p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium" htmlFor="name">Name</label>
            <Input id="name" name="name" placeholder="Your Name" value={form.name} onChange={handleChange} required disabled={isLoading} />
          </div>
          <div>
            <label className="block mb-1 font-medium" htmlFor="email">Email</label>
            <Input id="email" name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handleChange} required disabled={isLoading} />
          </div>
          <div>
            <label className="block mb-1 font-medium" htmlFor="password">Password</label>
            <Input id="password" name="password" type="password" placeholder="********" value={form.password} onChange={handleChange} required minLength={8} disabled={isLoading} />
          </div>
          {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>}
          <Button className="w-full" type="submit" disabled={isLoading}>{isLoading ? "Creating account..." : "Sign Up"}</Button>
        </form>
      </div>
    </div>
  )
} 