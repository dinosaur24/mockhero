import Image from "next/image"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

const footerLinks = {
  product: [
    { label: "Documentation", href: "/docs" },
    { label: "API Reference", href: "/docs/api-reference" },
    { label: "Playground", href: "/#playground" },
    { label: "LLM Reference", href: "/llms.txt" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
    { label: "Cookie Policy", href: "/cookie-policy" },
    { label: "Refund Policy", href: "/refund-policy" },
  ],
}

export function Footer() {
  return (
    <footer className="px-4 md:px-6 py-12 lg:py-16 border-t border-border">
      <div className="mx-auto max-w-screen-xl">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {/* Logo & Tagline */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-heading text-lg font-bold tracking-tight">
              <Image src="/logo.png" alt="" width={32} height={32} className="h-8 w-8" />
              MockHero
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              The API every developer and AI coding agent needs.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} MockHero. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="https://x.com/mockherodev"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="X"
            >
              <XIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
