"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
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
    title: "Account",
    links: [
      { href: "/docs/rate-limits", label: "Rate Limits" },
    ],
  },
]

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-6" aria-label="Documentation">
      {sidebarSections.map((section) => (
        <div key={section.title}>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {section.title}
          </h4>
          <ul className="flex flex-col gap-0.5">
            {section.links.map((link) => {
              // Match path without hash for sub-links
              const linkPath = link.href.split("#")[0]
              const isActive = pathname === linkPath && !link.href.includes("#")
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onNavigate}
                    className={cn(
                      "block rounded-md px-3 py-1.5 text-sm transition-colors",
                      isActive
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
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

export function DocsSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile: floating sheet trigger */}
      <div className="sticky top-20 z-30 flex items-center border-b border-border bg-background px-4 py-2 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Menu className="size-4" />
              <span className="text-sm">Docs menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 pt-10">
            <SheetTitle className="sr-only">Documentation navigation</SheetTitle>
            <SidebarNav onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: static sidebar */}
      <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-60 shrink-0 overflow-y-auto border-r border-border px-4 py-8 md:block">
        <SidebarNav />
      </aside>
    </>
  )
}
