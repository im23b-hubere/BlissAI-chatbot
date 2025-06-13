"use client"

import { usePathname } from "next/navigation"
import Footer from "@/components/Footer"

export default function FooterVisibility() {
  const pathname = usePathname()
  if (pathname.startsWith("/chat")) return null
  return <Footer />
} 