"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import {
  Search,
  Mail,
  Clock,
  ExternalLink,
  BookOpen,
  Rocket,
  Key,
  Send,
  Database,
  MessageSquare,
  Layout,
  FileJson,
  Link2,
  Globe,
  Bot,
  Gauge,
  CreditCard,
  AlertTriangle,
  Wrench,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { helpArticles, helpCategories, type HelpArticle } from "./articles"
import type { LucideIcon } from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Icon map — resolve the icon component from the category data       */
/* ------------------------------------------------------------------ */
const iconMap: Record<string, LucideIcon> = {
  Rocket,
  Key,
  Send,
  Database,
  MessageSquare,
  Layout,
  FileJson,
  Link2,
  Globe,
  Bot,
  Gauge,
  CreditCard,
  AlertTriangle,
  Wrench,
}

function getCategoryIcon(iconName: string): LucideIcon {
  return iconMap[iconName] ?? BookOpen
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function HelpClient() {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounce search input by 200ms
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 200)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [searchQuery])

  // Filter articles
  const filteredArticles = useMemo(() => {
    let articles = helpArticles

    if (activeCategory) {
      articles = articles.filter((a) => a.category === activeCategory)
    }

    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase()
      articles = articles.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q)) ||
          a.content.toLowerCase().includes(q)
      )
    }

    return articles
  }, [debouncedQuery, activeCategory])

  // Group filtered articles by category
  const groupedArticles = useMemo(() => {
    const groups: Record<string, HelpArticle[]> = {}
    for (const article of filteredArticles) {
      if (!groups[article.category]) groups[article.category] = []
      groups[article.category].push(article)
    }
    return groups
  }, [filteredArticles])

  // Article count per category (always based on full set, not filtered)
  const articleCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const article of helpArticles) {
      counts[article.category] = (counts[article.category] || 0) + 1
    }
    return counts
  }, [])

  const orderedCategories = helpCategories.filter((c) => groupedArticles[c.id])

  // Render article HTML content safely (all content is from our static articles file)
  function ArticleBody({ html }: { html: string }) {
    return (
      <div
        className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed [&_pre]:bg-muted [&_pre]:rounded-md [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre]:text-[11px] [&_code]:bg-muted [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[11px] [&_a]:text-primary [&_a]:underline [&_ul]:space-y-1 [&_ol]:space-y-1 [&_li]:text-xs [&_p]:text-xs"
        // eslint-disable-next-line react/no-danger -- static content from articles.ts, not user input
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-lg font-bold tracking-tight">Help Center</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Find answers to common questions about MockHero
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Mobile category filter — horizontal scrollable badges */}
      <div className="flex gap-2 overflow-x-auto pb-1 md:hidden -mx-4 px-4 scrollbar-none">
        <button
          onClick={() => setActiveCategory(null)}
          className="shrink-0"
        >
          <Badge
            variant={activeCategory === null ? "default" : "outline"}
            className="cursor-pointer"
          >
            All
          </Badge>
        </button>
        {helpCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            className="shrink-0"
          >
            <Badge
              variant={activeCategory === cat.id ? "default" : "outline"}
              className="cursor-pointer"
            >
              {cat.label}
            </Badge>
          </button>
        ))}
      </div>

      {/* Main layout: sidebar + content */}
      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-56 shrink-0">
          <nav className="space-y-0.5 sticky top-8">
            <button
              onClick={() => setActiveCategory(null)}
              className={`flex items-center gap-2 w-full rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                activeCategory === null
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">All Articles</span>
              <span className="ml-auto text-[10px] tabular-nums text-muted-foreground">
                {helpArticles.length}
              </span>
            </button>

            <Separator className="my-1.5" />

            {helpCategories.map((cat) => {
              const Icon = getCategoryIcon(cat.icon)
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                  className={`flex items-center gap-2 w-full rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                    activeCategory === cat.id
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{cat.label}</span>
                  <span className="ml-auto text-[10px] tabular-nums text-muted-foreground">
                    {articleCounts[cat.id] ?? 0}
                  </span>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Articles content */}
        <div className="flex-1 min-w-0">
          {filteredArticles.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium">No articles found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try a different search term or browse all categories
                </p>
                {(debouncedQuery || activeCategory) && (
                  <button
                    onClick={() => {
                      setSearchQuery("")
                      setActiveCategory(null)
                    }}
                    className="mt-3 text-xs text-primary hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orderedCategories.map((cat) => {
                const Icon = getCategoryIcon(cat.icon)
                const articles = groupedArticles[cat.id]
                return (
                  <Card key={cat.id}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <CardTitle>{cat.label}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Accordion type="single" collapsible className="w-full">
                        {articles.map((article) => (
                          <AccordionItem key={article.id} value={article.id}>
                            <AccordionTrigger className="text-xs hover:no-underline">
                              {article.title}
                            </AccordionTrigger>
                            <AccordionContent>
                              <ArticleBody html={article.content} />
                              <div className="flex gap-1.5 mt-3 flex-wrap">
                                {article.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-[9px]">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Contact Support */}
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Still need help?</CardTitle>
          <CardDescription>
            Can&apos;t find what you&apos;re looking for? Our support team is here to help.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-muted p-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-medium">Email us</p>
                <a
                  href="mailto:hello@mockhero.dev"
                  className="text-xs text-primary hover:underline"
                >
                  hello@mockhero.dev
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-md bg-muted p-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-medium">Response time</p>
                <p className="text-xs text-muted-foreground">
                  We typically respond within 24 hours
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-md bg-muted p-2">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-medium">Documentation</p>
                <a
                  href="https://mockhero.dev/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  mockhero.dev/docs
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
