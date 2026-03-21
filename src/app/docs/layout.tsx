import { Navbar } from "@/components/landing/navbar"
import { DocsSidebar } from "./docs-sidebar"

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
      <div className="mx-auto flex max-w-screen-xl">
        <DocsSidebar />
        <main className="min-w-0 flex-1 px-6 py-10 md:px-12 lg:px-16">
          <article className="mx-auto max-w-3xl">
            {children}
          </article>
        </main>
      </div>
    </div>
  )
}
