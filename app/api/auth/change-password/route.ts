import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Nicht eingeloggt." }, { status: 401 });
  }
  const { oldPassword, newPassword } = await req.json();
  if (!oldPassword || !newPassword) {
    return NextResponse.json({ error: "Fehlende Felder." }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || !user.hashedPassword) {
    return NextResponse.json({ error: "User nicht gefunden." }, { status: 404 });
  }
  const valid = await bcrypt.compare(oldPassword, user.hashedPassword);
  if (!valid) {
    return NextResponse.json({ error: "Altes Passwort ist falsch." }, { status: 403 });
  }
  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { email: session.user.email }, data: { hashedPassword: hashed } });
  return NextResponse.json({ success: true });
} 