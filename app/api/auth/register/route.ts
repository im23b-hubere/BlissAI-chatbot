import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcrypt"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }
    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 })
    }
    // Hash password
    const hashed = await bcrypt.hash(password, 10)
    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword: hashed,
      },
      select: { id: true, name: true, email: true }
    })
    return NextResponse.json({ user })
  } catch (error) {
    console.error("[REGISTER_POST]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 