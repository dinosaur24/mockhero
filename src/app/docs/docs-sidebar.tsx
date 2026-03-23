"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const sidebarSections = [
  {
    title: "Getting Started",
    links: [
      { href: "/docs", label: "Overview" },
      { href: "/docs/authentication", label: "Authentication" },
      { href: "/docs/mcp", label: "MCP Server" },
    ],
  },
  {
    title: "API Reference",
    links: [
      { href: "/docs/api-reference", label: "Endpoints" },
      { href: "/docs/api-reference#generate-async", label: "Async Generation" },
      { href: "/docs/api-reference#webhooks", label: "Webhooks" },
      { href: "/docs/errors", label: "Error Codes" },
    ],
  },
  {
    title: "Data Generation",
    links: [
      { href: "/docs/field-types", label: "Field Types" },
      { href: "/docs/templates", label: "Templates" },
    ],
  },
  {
    title: "Integrations",
    links: [
      { href: "/docs/database-guides", label: "Database Guides" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/docs/rate-limits", label: "Rate Limits" },
    ],
  },
]

/** Collect all hash-based section IDs from the sidebar config */
function getHashIds(): string[] {
  return sidebarSections
    .flatMap((s) => s.links)
    .filter((l) => l.href.includes("#"))
    .map((l) => l.href.split("#")[1])
}

function useActiveSection() {
  const pathname = usePathname()
  const [activeHash, setActiveHash] = useState("")

  useEffect(() => {
    const ids = getHashIds()
    // Only observe if we're on a page that has hash links (e.g. /docs/api-reference)
    const hasHashLinks = sidebarSections
      .flatMap((s) => s.links)
      .some((l) => l.href.includes("#") && l.href.split("#")[0] === pathname)

    if (!hasHashLinks) {
      setActiveHash("")
      return
    }

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[]

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible.length > 0) {
          setActiveHash(visible[0].target.id)
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [pathname])

  return activeHash
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const activeHash = useActiveSection()

  return (
    <nav className="flex flex-col gap-5 md:gap-6" aria-label="Documentation">
      {sidebarSections.map((section) => (
        <div key={section.title}>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {section.title}
          </h4>
          <ul className="flex flex-col gap-0.5">
            {section.links.map((link) => {
              const linkPath = link.href.split("#")[0]
              const linkHash = link.href.split("#")[1] ?? ""

              let isActive = false
              if (linkHash) {
                // Hash link: active when this section is in view
                isActive = pathname === linkPath && activeHash === linkHash
              } else {
                // Page link: active when on that page (and no hash section is active)
                isActive = pathname === linkPath && !activeHash
              }

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onNavigate}
                    className={cn(
                      "block rounded-md px-3 py-2.5 text-sm transition-colors min-h-[44px] flex items-center",
                      "md:py-1.5 md:min-h-0",
                      isActive
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/80"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

/** Mobile: full-width sticky bar with bottom sheet trigger */
export function DocsSidebarMobile() {
  const [open, setOpen] = useState(false)

  return (
    <div className="sticky top-20 z-30 flex items-center border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-2 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2 min-h-[44px] -ml-2 px-3">
            <BookOpen className="size-4" />
            <span className="text-sm font-medium">Docs menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="max-h-[70dvh] rounded-t-2xl px-6 pb-8 pt-4"
        >
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted-foreground/30" />
          <SheetTitle className="sr-only">Documentation navigation</SheetTitle>
          <div className="overflow-y-auto overscroll-contain">
            <SidebarNav onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

/** Desktop: static sidebar in flex row */
export function DocsSidebarDesktop() {
  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-60 shrink-0 overflow-y-auto border-r border-border px-4 py-8 md:block">
      <SidebarNav />
    </aside>
  )
}
