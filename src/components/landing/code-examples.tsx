"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

const codeExamples: Record<string, string> = {
  curl: `curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "Authorization: Bearer mh_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "tables": [{
      "name": "users",
      "count": 50,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "email", "type": "email" },
        { "name": "name", "type": "full_name" },
        { "name": "created_at", "type": "datetime" }
      ]
    }],
    "format": "json"
  }'`,
  javascript: `const response = await fetch('https://api.mockhero.dev/api/v1/generate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer mh_xxxxx',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    tables: [{
      name: 'users',
      count: 50,
      fields: [
        { name: 'id', type: 'uuid' },
        { name: 'email', type: 'email' },
        { name: 'name', type: 'full_name' },
        { name: 'created_at', type: 'datetime' }
      ]
    }],
    format: 'json'
  })
});

const { data, meta } = await response.json();
console.log(\`Generated \${meta.total_records} records in \${meta.generation_time_ms}ms\`);`,
  python: `import requests

response = requests.post(
    'https://api.mockhero.dev/api/v1/generate',
    headers={
        'Authorization': 'Bearer mh_xxxxx',
        'Content-Type': 'application/json'
    },
    json={
        'tables': [{
            'name': 'users',
            'count': 50,
            'fields': [
                {'name': 'id', 'type': 'uuid'},
                {'name': 'email', 'type': 'email'},
                {'name': 'name', 'type': 'full_name'},
                {'name': 'created_at', 'type': 'datetime'}
            ]
        }],
        'format': 'json'
    }
)

data = response.json()
print(f"Generated {data['meta']['total_records']} records in {data['meta']['generation_time_ms']}ms")`,
}

export function CodeExamples() {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("curl")

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeExamples[activeTab])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API may fail on HTTP or without user gesture
    }
  }

  return (
    <section id="docs" className="px-4 md:px-6 py-16 lg:py-24 bg-muted/50">
      <div className="mx-auto max-w-screen-xl">
        <div className="max-w-2xl mb-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Integrate in <span className="text-primary">seconds</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            One API call. Any language. Plain English prompts on every tier.
          </p>
        </div>

        <Card className="overflow-hidden bg-card">
          <Tabs defaultValue="curl" onValueChange={setActiveTab}>
            <div className="flex items-center justify-between border-b border-border px-4">
              <TabsList className="bg-transparent h-auto p-0 gap-4">
                <TabsTrigger value="curl" className="rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent shadow-none ring-0 outline-none px-0 py-3 text-xs">
                  cURL
                </TabsTrigger>
                <TabsTrigger value="javascript" className="rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent shadow-none ring-0 outline-none px-0 py-3 text-xs">
                  JavaScript
                </TabsTrigger>
                <TabsTrigger value="python" className="rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent shadow-none ring-0 outline-none px-0 py-3 text-xs">
                  Python
                </TabsTrigger>
              </TabsList>
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                <span className="ml-1 text-xs">{copied ? "Copied" : "Copy"}</span>
              </Button>
            </div>
            {Object.entries(codeExamples).map(([key, code]) => (
              <TabsContent key={key} value={key} className="m-0">
                <div className="p-6 overflow-x-auto">
                  <pre className="text-sm font-mono leading-relaxed">
                    <code>{code}</code>
                  </pre>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </Card>

        <p className="mt-4 text-sm text-muted-foreground">
          <Badge variant="outline" className="mr-2 text-xs">Tip</Badge>
          Replace <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">mh_xxxxx</code> with your actual API key from the dashboard.
        </p>
      </div>
    </section>
  )
}
