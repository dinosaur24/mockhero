"use client"

import type { ReactNode } from "react"

/**
 * Wraps a <Table> and renders it as stacked cards on mobile.
 *
 * On mobile (<768px): hides the table, shows a stacked card view.
 * On desktop: shows the normal scrollable table.
 *
 * If `mobileCards` is provided, those are rendered on mobile.
 * Otherwise, falls back to horizontal scroll.
 */
export function ResponsiveTable({
  children,
  mobileCards,
}: {
  children: ReactNode
  mobileCards?: ReactNode
}) {
  if (!mobileCards) {
    // Fallback: horizontal scroll with momentum scrolling
    return (
      <div className="w-full overflow-x-auto -webkit-overflow-scrolling-touch">
        {children}
      </div>
    )
  }

  return (
    <>
      {/* Mobile: stacked cards */}
      <div className="md:hidden">{mobileCards}</div>
      {/* Desktop: standard table */}
      <div className="hidden md:block w-full overflow-x-auto">{children}</div>
    </>
  )
}

/**
 * A single mobile card row for use inside ResponsiveTable's mobileCards prop.
 * Renders key-value pairs in a compact, touch-friendly card.
 */
export function MobileCard({
  items,
}: {
  items: { label: string; value: ReactNode }[]
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-sm">
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
        {items.map((item) => (
          <div key={item.label} className="contents">
            <dt className="text-muted-foreground text-xs font-medium whitespace-nowrap py-0.5">
              {item.label}
            </dt>
            <dd className="text-foreground break-words py-0.5">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
