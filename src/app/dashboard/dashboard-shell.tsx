"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SignOutButton } from "@clerk/nextjs"
import { LayoutDashboard, Key, BarChart3, CreditCard, Settings, LogOut } from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/api-keys", label: "Keys", icon: Key },
  { href: "/dashboard/usage", label: "Usage", icon: BarChart3 },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2 px-2 py-1">
          <img src="/logo.png" alt="" className="h-7 w-7" />
          <span className="font-heading text-sm font-bold tracking-tight">MockHero</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SignOutButton>
              <SidebarMenuButton>
                <LogOut className="h-4 w-4" />
                Sign out
              </SidebarMenuButton>
            </SignOutButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <div className="flex items-center justify-around h-14 px-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] rounded-md transition-colors ${
                isActive
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              }`}
            >
              <item.icon className="size-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
      {/* Safe area spacing for iPhones with home indicator */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      {/* Desktop: sidebar layout */}
      <div className="hidden md:contents">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <main className="flex-1">
              <div className="mx-auto max-w-4xl px-6 py-8">
                {children}
              </div>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>

      {/* Mobile: bottom nav layout */}
      <div className="md:hidden flex flex-col min-h-svh">
        <header className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="" className="h-6 w-6" />
            <span className="font-heading text-sm font-bold tracking-tight">MockHero</span>
          </Link>
          <SignOutButton>
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <LogOut className="size-4" />
              <span>Sign out</span>
            </button>
          </SignOutButton>
        </header>
        <main className="flex-1">
          <div className="px-4 py-4 pb-20">
            {children}
          </div>
        </main>
        <MobileBottomNav />
      </div>
    </TooltipProvider>
  )
}
