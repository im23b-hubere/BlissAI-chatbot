import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";

const STACK_CLIENT_ID = process.env.NEXT_PUBLIC_STACK_PROJECT_ID!;
const STACK_CLIENT_SECRET = process.env.STACK_SECRET_SERVER_KEY!;

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  // 1. Tausche Code gegen Access Token
  const tokenRes = await fetch("https://app.stack-auth.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: STACK_CLIENT_ID,
      client_secret: STACK_CLIENT_SECRET,
      redirect_uri: `${req.nextUrl.origin}/api/stackauth/callback`,
    }),
  });
  if (!tokenRes.ok) {
    return NextResponse.json({ error: "Token exchange failed" }, { status: 401 });
  }
  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  // 2. Hole Userinfo
  const userRes = await fetch("https://app.stack-auth.com/api/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!userRes.ok) {
    return NextResponse.json({ error: "Userinfo fetch failed" }, { status: 401 });
  }
  const userInfo = await userRes.json();

  // 3. User in DB anlegen/finden
  let user = await prisma.user.findUnique({ where: { email: userInfo.email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: userInfo.name,
        email: userInfo.email,
        image: userInfo.picture || null,
      },
    });
  }

  // 4. JWT ausstellen
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  // 5. Redirect mit Token als Query (oder Cookie setzen)
  const redirectUrl = `${req.nextUrl.origin}/chat?token=${token}`;
  return NextResponse.redirect(redirectUrl);
}

export const POST = GET; 