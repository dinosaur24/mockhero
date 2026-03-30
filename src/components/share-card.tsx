"use client"

import { useState } from "react"
import { Check, Copy, ExternalLink } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"

interface ShareCardProps {
  records: number
  tables: number
  timeMs: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

export function ShareCard({ records, tables, timeMs, open, onOpenChange }: ShareCardProps) {
  const [copied, setCopied] = useState(false)

  const tweetText = `I just generated ${records} realistic test records in ${timeMs}ms with @MockHeroDev

${tables} table(s) \u2022 ${records} records \u2022 ${timeMs}ms

Try it free \u2192 mockhero.dev?utm_source=twitter&utm_medium=share&utm_campaign=playground`

  const linkedInText = `Just discovered MockHero \u2014 generated ${records} realistic test records in ${timeMs}ms. The API supports 156 field types across 22 locales.

Try it free \u2192 mockhero.dev?utm_source=linkedin&utm_medium=share&utm_campaign=playground`

  const copyText = `I just generated ${records} realistic test records in ${timeMs}ms with MockHero

${tables} table(s) \u2022 ${records} records \u2022 ${timeMs}ms

Try it free \u2192 https://mockhero.dev?utm_source=clipboard&utm_medium=share&utm_campaign=playground`

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://mockhero.dev?utm_source=linkedin&utm_medium=share&utm_campaign=playground`)}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API may fail
    }
  }

  return (
    <Modal open={open} onClose={() => onOpenChange(false)} title="Share your results">
      {/* Preview card */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mb-5">
        <p className="text-sm font-medium text-foreground">
          I just generated{" "}
          <span className="font-bold text-primary">{records}</span> realistic test
          records in{" "}
          <span className="font-bold text-primary">{timeMs}ms</span> with MockHero
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{tables} table{tables !== 1 ? "s" : ""}</span>
          <span>&bull;</span>
          <span>{records} records</span>
          <span>&bull;</span>
          <span>{timeMs}ms</span>
        </div>
      </div>

      {/* Share buttons */}
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => window.open(twitterUrl, "_blank", "noopener,noreferrer")}
        >
          <XIcon className="mr-2 h-4 w-4" />
          Share on X
          <ExternalLink className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => window.open(linkedInUrl, "_blank", "noopener,noreferrer")}
        >
          <LinkedInIcon className="mr-2 h-4 w-4" />
          Share on LinkedIn
          <ExternalLink className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="mr-2 h-4 w-4 text-green-600" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          {copied ? "Copied to clipboard!" : "Copy share text"}
        </Button>
      </div>
    </Modal>
  )
}
