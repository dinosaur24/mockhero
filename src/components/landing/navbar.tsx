"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { useAuth, UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#playground", label: "Playground" },
  { href: "#compare", label: "Compare" },
  { href: "#pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/blog", label: "Blog" },
]

export function Navbar() {
  const { isSignedIn } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile menu on Escape key
  useEffect(() => {
    if (!mobileOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false)
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [mobileOpen])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-20 max-w-screen-xl items-center px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="mr-10 flex items-center gap-2 font-heading text-2xl font-bold tracking-tight">
          <Image src="/logo.png" alt="" width={44} height={44} className="h-11 w-11" />
          MockHero
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-[15px]">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {isSignedIn ? (
            <>
              <Button variant="ghost" className="h-10 px-5 text-sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <UserButton />
            </>
          ) : (
            <>
              <Button variant="ghost" className="h-10 px-5 text-sm" asChild>
                <Link href="/sign-in" data-fast-goal="click_sign_in" data-fast-goal-location="navbar">Sign in</Link>
              </Button>
              <Button className="h-10 px-5 text-sm" asChild>
                <Link href="/sign-up" data-fast-goal="click_get_api_key" data-fast-goal-location="navbar">Get API Key</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Separator className="my-2" />
            {isSignedIn ? (
              <Button variant="ghost" size="sm" className="justify-start" asChild>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="justify-start" asChild>
                  <Link href="/sign-in" onClick={() => setMobileOpen(false)} data-fast-goal="click_sign_in" data-fast-goal-location="navbar_mobile">Sign in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/sign-up" onClick={() => setMobileOpen(false)} data-fast-goal="click_get_api_key" data-fast-goal-location="navbar_mobile">Get API Key</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
