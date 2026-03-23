"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";

interface ApiKeyCardProps {
  /** Full raw key — only set on first view after generation */
  rawKey?: string | null;
  /** Key prefix for display (always available) */
  keyPrefix: string;
}

export function ApiKeyCard({ rawKey, keyPrefix }: ApiKeyCardProps) {
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [currentPrefix, setCurrentPrefix] = useState(keyPrefix);
  const [currentRawKey, setCurrentRawKey] = useState(rawKey);
  const { toast } = useToast();

  const displayKey = currentRawKey ?? `${currentPrefix}${"•".repeat(52)}`;

  async function handleCopy() {
    const textToCopy = currentRawKey ?? currentPrefix;
    await navigator.clipboard.writeText(textToCopy);
    toast(currentRawKey ? "API key copied!" : "Key prefix copied!");
  }

  async function handleRegenerate() {
    setIsRegenerating(true);
    try {
      const res = await fetch("/api/dashboard/regenerate-key", { method: "POST" });
      if (!res.ok) throw new Error("Failed to regenerate");
      const data = await res.json();
      setCurrentPrefix(data.keyPrefix);
      setCurrentRawKey(data.rawKey);
      setShowRegenModal(false);
      toast("API key regenerated! Copy your new key now.");
    } catch {
      toast("Failed to regenerate key", "error");
    } finally {
      setIsRegenerating(false);
    }
  }

  const curlExample = `curl -X POST https://mockhero.dev/api/v1/generate \\
  -H "x-api-key: ${currentRawKey ?? currentPrefix}..." \\
  -H "Content-Type: application/json" \\
  -d '{"tables":[{"name":"users","count":5,"fields":[{"name":"id","type":"uuid"},{"name":"name","type":"full_name"},{"name":"email","type":"email"}]}]}'`;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>API Key</CardTitle>
          <CardDescription>
            {currentRawKey
              ? "This key will only be shown once. Copy it now."
              : "Use this key to authenticate API requests."}
          </CardDescription>
        </CardHeader>

        {/* Key display */}
        <div className="flex items-center gap-2 rounded-md bg-muted p-3 font-mono text-sm">
          <span className="flex-1 truncate text-foreground">{displayKey}</span>
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            Copy
          </Button>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowRegenModal(true)}
          >
            Regenerate Key
          </Button>
        </div>

        {/* Quick start */}
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-foreground">Quick Start</p>
          <CodeBlock code={curlExample} language="bash" />
        </div>
      </Card>

      {/* Regeneration confirmation modal */}
      <Modal
        open={showRegenModal}
        onClose={() => setShowRegenModal(false)}
        title="Regenerate API Key?"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowRegenModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleRegenerate} disabled={isRegenerating}>
              {isRegenerating ? "Regenerating…" : "Regenerate"}
            </Button>
          </>
        }
      >
        <p>
          Your current API key will stop working immediately. Any applications
          or agents using it will need to be updated with the new key.
        </p>
      </Modal>
    </>
  );
}
