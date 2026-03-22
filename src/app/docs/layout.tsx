import { Navbar } from "@/components/landing/navbar"
import { DocsSidebarDesktop, DocsSidebarMobile } from "./docs-sidebar"

/**
 * Docs layout — Server Component.
 * The sidebar is extracted as a client component (needs usePathname),
 * keeping this layout in the server bundle for metadata support
 * and reduced client JS.
 */
export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Mobile: full-width sticky nav bar above content */}
      <DocsSidebarMobile />
      <div className="mx-auto flex max-w-screen-xl">
        {/* Desktop: static sidebar in flex row */}
        <DocsSidebarDesktop />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 md:px-12 md:py-10 lg:px-16">
          <article className="mx-auto max-w-3xl">
            {children}
          </article>
        </main>
      </div>
    </div>
  )
}
