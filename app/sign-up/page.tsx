"use client"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function SignUpPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Registration failed")
        setIsLoading(false)
        return
      }
      setSuccess("Account created! Redirecting to login...")
      setTimeout(() => {
        router.push("/login?email=" + encodeURIComponent(form.email))
      }, 1500)
    } catch (err) {
      setError("Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
      {/* Back Button */}
      <Link href="/" className="absolute top-6 left-6 z-10 bg-background/80 rounded-full shadow p-2 hover:bg-accent transition-colors" aria-label="Zurück zur Startseite">
        <ArrowLeft className="h-6 w-6" />
      </Link>
      <div className="relative w-full max-w-md mx-auto">
        <div className="bg-background/80 rounded-2xl shadow-xl p-8 flex flex-col items-center gap-4 border border-border">
          <h1 className="text-2xl font-bold mb-1 text-center">Create your account</h1>
          <p className="mb-4 text-center text-muted-foreground text-sm">
            Already have an account? <a href="/login" className="underline">Sign in</a>
          </p>
          <form onSubmit={handleSubmit} className="w-full space-y-3">
            <div>
              <label className="block mb-1 font-medium text-sm" htmlFor="name">Name</label>
              <Input id="name" name="name" placeholder="Your Name" value={form.name} onChange={handleChange} required disabled={isLoading} />
            </div>
            <div>
              <label className="block mb-1 font-medium text-sm" htmlFor="email">Email</label>
              <Input id="email" name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handleChange} required disabled={isLoading} ref={emailRef} />
            </div>
            <div>
              <label className="block mb-1 font-medium text-sm" htmlFor="password">Password</label>
              <Input id="password" name="password" type="password" placeholder="********" value={form.password} onChange={handleChange} required minLength={8} disabled={isLoading} ref={passwordRef} />
            </div>
            {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>}
            {success && <div className="bg-success/10 text-success text-sm p-3 rounded-md">{success}</div>}
            <Button className="w-full" type="submit" disabled={isLoading}>{isLoading ? "Creating account..." : "Sign Up"}</Button>
          </form>
        </div>
      </div>
    </div>
  )
} 