/**
 * "Works with" trust bar — shows AI coding tools MockHero integrates with via MCP.
 * Placed right below the Hero section.
 */

const tools = [
  {
    name: "Cursor",
    logo: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
        <path d="M12 2L2 19.5h20L12 2zm0 4l6.9 11.5H5.1L12 6z" />
      </svg>
    ),
  },
  {
    name: "Claude Code",
    logo: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.5 14.5L6 12l1.4-1.4 3.1 3.1 6.1-6.1L18 9l-7.5 7.5z" />
      </svg>
    ),
  },
  {
    name: "VS Code",
    logo: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
        <path d="M17.5 0L7 8.5 2.9 5.4.5 6.6V17.4l2.4 1.2L7 15.5 17.5 24l5-2.5V2.5L17.5 0zM7 12l-3.5 2.6V9.4L7 12zm10.5 5.7L13 13.9V10l4.5-3.7v11.4z" />
      </svg>
    ),
  },
  {
    name: "Windsurf",
    logo: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
        <path d="M3 17h18v2H3v-2zm0-5h18v2H3v-2zm0-5h18v2H3V7z" />
      </svg>
    ),
  },
  {
    name: "Claude Desktop",
    logo: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2" />
        <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    name: "Any MCP Client",
    logo: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.2 4.2l2.8 2.8M17 17l2.8 2.8M1 12h4M19 12h4M4.2 19.8l2.8-2.8M17 7l2.8-2.8" />
      </svg>
    ),
  },
];

export function WorksWith() {
  return (
    <section className="border-b border-border/40 bg-muted/30 py-8">
      <div className="mx-auto max-w-5xl px-6">
        <p className="mb-6 text-center text-sm font-medium text-muted-foreground">
          Works with your favorite AI coding tools
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className="flex items-center gap-2.5 text-muted-foreground/70 transition-colors hover:text-foreground"
            >
              {tool.logo}
              <span className="text-sm font-medium">{tool.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
