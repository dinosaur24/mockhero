import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const stats = [
  { value: "156", label: "Field Types" },
  { value: "22", label: "Locales" },
  { value: "<50ms", label: "Generation" },
]

const codeSnippet = `{
  "tables": [{
    "name": "users",
    "count": 100,
    "fields": [
      { "name": "id",    "type": "uuid" },
      { "name": "email", "type": "email" },
      { "name": "name",  "type": "full_name" }
    ]
  }]
}`

interface AuthShellProps {
  children: React.ReactNode
  mode: "sign-in" | "sign-up"
}

export function AuthShell({ children, mode }: AuthShellProps) {
  return (
    <div className="min-h-screen flex">
      {/* ─── Left panel — brand ─── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[oklch(0.148_0.004_228.8)] text-white">
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Subtle purple glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[oklch(0.457_0.24_277.023)] opacity-[0.06] blur-[120px]" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link
            href="/"
            className="font-heading text-xl font-bold tracking-tight text-white"
          >
            MockHero
          </Link>

          {/* Center — hero copy + code card */}
          <div>
            <h2 className="text-4xl font-bold tracking-tight leading-tight">
              Realistic test data
              <br />
              <span className="text-white/40">in one API call.</span>
            </h2>

            <p className="mt-6 text-[15px] text-white/50 leading-relaxed max-w-md">
              Send a schema, get back production-quality fake data with proper
              names, valid formats, and referential integrity.
            </p>

            {/* Code card */}
            <div className="mt-10 rounded-lg bg-white/[0.04] border border-white/[0.08] overflow-hidden max-w-md">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06]">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                </div>
                <span className="text-[11px] font-mono text-white/25 ml-2">
                  POST /v1/generate
                </span>
              </div>
              <pre className="p-4 text-[12px] font-mono leading-relaxed text-white/35 overflow-hidden">
                <code>{codeSnippet}</code>
              </pre>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-10">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold tracking-tight text-white">
                  {stat.value}
                </p>
                <p className="text-xs text-white/35 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Right panel — auth form ─── */}
      <div className="w-full lg:w-1/2 flex flex-col bg-background">
        {/* Top bar */}
        <div className="flex items-center justify-between p-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Home
          </Link>

          {mode === "sign-in" ? (
            <Link
              href="/sign-up"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Don&apos;t have an account?{" "}
              <span className="font-medium text-primary">Sign up</span>
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Already have an account?{" "}
              <span className="font-medium text-primary">Sign in</span>
            </Link>
          )}
        </div>

        {/* Centered auth form */}
        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-[400px]">
            {/* Mobile-only brand header (left panel is hidden on mobile) */}
            <div className="lg:hidden text-center mb-10">
              <Link
                href="/"
                className="font-heading text-2xl font-bold tracking-tight"
              >
                MockHero
              </Link>
              <p className="mt-2 text-sm text-muted-foreground">
                {mode === "sign-in"
                  ? "Welcome back"
                  : "Get your free API key"}
              </p>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
