/**
 * "Works with" trust bar — shows AI coding tools MockHero integrates with via MCP.
 * Placed right below the Hero section. Matches hero background.
 */

const tools = [
  {
    name: "Cursor",
    logo: (
      <svg viewBox="0 0 100 100" className="h-8 w-8" fill="currentColor">
        <path d="M10 90L50 10l40 80H10zm10-8h60L50 22 20 82z" />
      </svg>
    ),
  },
  {
    name: "Claude Code",
    logo: (
      <svg viewBox="0 0 100 100" className="h-8 w-8" fill="currentColor">
        <path d="M50 5C25.2 5 5 25.2 5 50s20.2 45 45 45 45-20.2 45-45S74.8 5 50 5zm0 12c18.2 0 33 14.8 33 33S68.2 83 50 83 17 68.2 17 50s14.8-33 33-33zm-8 42l-4 4-16-16 16-16 4 4-12 12 12 12zm16 0l4 4 16-16-16-16-4 4 12 12-12 12z" />
      </svg>
    ),
  },
  {
    name: "VS Code",
    logo: (
      <svg viewBox="0 0 100 100" className="h-8 w-8" fill="currentColor">
        <path d="M71.6 1L30 35.8 12.5 22.4 2 27v46l10.5 4.6L30 64.2 71.6 99l26.9-11V12L71.6 1zM30 50l-15 10.8V39.2L30 50zm41.6 23.6L50 56.5V43.5l21.6-17.1v47.2z" />
      </svg>
    ),
  },
  {
    name: "Windsurf",
    logo: (
      <svg viewBox="0 0 100 100" className="h-8 w-8" fill="currentColor">
        <path d="M15 25h70a5 5 0 010 10H15a5 5 0 010-10zm10 20h50a5 5 0 010 10H25a5 5 0 010-10zm-5 20h60a5 5 0 010 10H20a5 5 0 010-10z" />
      </svg>
    ),
  },
  {
    name: "OpenAI Codex",
    logo: (
      <svg viewBox="0 0 100 100" className="h-8 w-8" fill="currentColor">
        <path d="M50 5C25.2 5 5 25.2 5 50s20.2 45 45 45 45-20.2 45-45S74.8 5 50 5zm0 10c19.3 0 35 15.7 35 35S69.3 85 50 85 15 69.3 15 50s15.7-35 35-35zm-7 20v30h6V47l12 18h8V35h-6v18L51 35h-8z" />
      </svg>
    ),
  },
  {
    name: "Any MCP Client",
    logo: (
      <svg viewBox="0 0 100 100" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="6">
        <circle cx="50" cy="50" r="12" />
        <path d="M50 8v16M50 76v16M8 50h16M76 50h16M21.7 21.7l11.3 11.3M67 67l11.3 11.3M21.7 78.3l11.3-11.3M67 33l11.3-11.3" />
      </svg>
    ),
  },
];

export function WorksWith() {
  return (
    <section className="py-14 px-4 md:px-6">
      <div className="mx-auto max-w-5xl">
        <p className="mb-10 text-center text-base font-medium tracking-wide text-muted-foreground">
          Works with your favorite AI coding tools
        </p>
        <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className="flex flex-col items-center gap-3 text-muted-foreground/50 transition-colors hover:text-foreground"
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
