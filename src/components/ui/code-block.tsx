"use client";

import { cn } from "@/lib/utils";
import { useState, useCallback } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
  showCopy?: boolean;
  className?: string;
}

export function CodeBlock({
  code,
  language,
  showCopy = true,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div
      className={cn(
        "relative rounded-xl bg-[#1A1A2E] overflow-hidden",
        className
      )}
    >
      {language && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
          <span className="text-xs text-white/50 font-mono">{language}</span>
        </div>
      )}
      {showCopy && (
        <button
          onClick={handleCopy}
          className="absolute top-2 right-3 text-xs text-white/40 hover:text-white/80 transition-colors font-mono px-2 py-1 rounded bg-white/5 hover:bg-white/10"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      )}
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm font-mono text-white/90 leading-relaxed whitespace-pre">
          {code}
        </code>
      </pre>
    </div>
  );
}
