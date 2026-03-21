/**
 * Plain English → Structured Schema conversion.
 *
 * Uses an LLM via OpenRouter to interpret natural language descriptions
 * and convert them into MockHero's schema format. The LLM is ONLY used
 * for schema interpretation — never for data generation itself.
 *
 * Architecture:
 *   "50 German users with orders" → LLM → { tables: [...] } → same engine → data
 */

import { FIELD_TYPES, SUPPORTED_LOCALES } from "./types";
import type { GenerateRequest } from "./types";
import { parseSchema } from "./schema-parser";

// ── Configuration ────────────────────────────────────────

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Default model: Gemini 2.0 Flash — $0.10/M input, $0.40/M output.
 * Fast, cheap, excellent at structured JSON output.
 * Override via OPENROUTER_MODEL env var.
 */
const DEFAULT_MODEL = "google/gemini-2.0-flash-001";

// ── System Prompt ────────────────────────────────────────

const SYSTEM_PROMPT = `You are a schema converter for MockHero, a test data generation API.

Your ONLY job: convert a plain English description into a JSON schema that MockHero's engine understands.

## Output Format

Return ONLY valid JSON matching this exact structure (no markdown, no explanation, no code fences):

{
  "tables": [
    {
      "name": "table_name",
      "count": 50,
      "fields": [
        { "name": "field_name", "type": "field_type" },
        { "name": "field_name", "type": "field_type", "params": { ... } }
      ]
    }
  ],
  "locale": "en",
  "format": "json"
}

## Available Field Types

${FIELD_TYPES.filter(t => t !== "nullable").join(", ")}

## Key Field Type Parameters

- first_name, last_name, phone, city, address, postal_code: locale-aware (set locale at top level)
- email: optional "domain" param (e.g. {"domain": "company.de"})
- enum: requires "values" array, optional "weights" array (e.g. {"values": ["a","b"], "weights": [0.7, 0.3]})
- ref: requires "table" and "field" params (e.g. {"table": "users", "field": "id"}) — THIS CREATES FOREIGN KEYS
- decimal/price/amount: optional "min" and "max" params
- datetime/date: optional "min" and "max" params (ISO 8601 strings)
- boolean: optional "probability" param (0-1, probability of true)
- integer: optional "min" and "max" params
- rating: returns 1-5 with realistic distribution
- nullable: set "nullable": true on any field, optional "null_rate" in params (0-1, default 0.15)

## Supported Locales

${SUPPORTED_LOCALES.join(", ")}

## Rules

1. ALWAYS include an "id" field (type "uuid") as the first field in every table.
2. When the user mentions relationships (e.g. "orders for users"), use "ref" type to link tables.
3. Generate parent tables before child tables in the array (users before orders).
4. Infer reasonable counts if not specified (default: 50 for main tables, 3-5x for child tables).
5. Infer locale from context: "German names" → locale "de", "French users" → locale "fr".
6. If the user mentions a country mix, use an enum field with country codes instead of setting locale.
7. Add realistic fields the user might expect even if not explicitly mentioned (e.g. created_at for users).
8. Use weighted enums for status-like fields (e.g. order status with realistic distribution).
9. Match field names to common database conventions (snake_case, descriptive).
10. NEVER output anything except the JSON object. No text before or after.`;

// ── Types ────────────────────────────────────────────────

export interface PromptConversionResult {
  success: true;
  schema: GenerateRequest;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
}

export interface PromptConversionError {
  success: false;
  error: string;
  /** If the LLM returned something but it failed validation */
  raw_output?: string;
  validation_errors?: Array<{ field: string; message: string }>;
}

// ── Main Function ────────────────────────────────────────

export async function convertPromptToSchema(
  prompt: string
): Promise<PromptConversionResult | PromptConversionError> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: "Plain English mode requires an OpenRouter API key. Set OPENROUTER_API_KEY in your environment.",
    };
  }

  const model = process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL;

  // Validate prompt length
  if (prompt.length < 10) {
    return {
      success: false,
      error: "Prompt too short. Describe what tables and data you need (e.g. '50 users with German names and 200 orders').",
    };
  }

  if (prompt.length > 5000) {
    return {
      success: false,
      error: "Prompt too long (max 5000 characters). Use the structured schema format for complex schemas.",
    };
  }

  try {
    // ── Call OpenRouter ──────────────────────────────────
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://mockhero.dev",
        "X-Title": "MockHero",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        temperature: 0.1, // Low temperature = more deterministic schema output
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return {
        success: false,
        error: `OpenRouter API error (${response.status}): ${errorBody.slice(0, 200)}`,
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return {
        success: false,
        error: "LLM returned empty response. Try rephrasing your prompt.",
      };
    }

    // ── Parse LLM output ────────────────────────────────
    // Strip markdown code fences if the model wraps in ```json ... ```
    const cleaned = content
      .replace(/^```(?:json)?\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "")
      .trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return {
        success: false,
        error: "LLM returned invalid JSON. Try rephrasing your prompt with more specific details.",
        raw_output: cleaned.slice(0, 500),
      };
    }

    // ── Validate through our existing schema parser ─────
    // This is the belt-and-suspenders: the same Zod validation
    // that protects the structured schema endpoint also validates
    // the LLM's output. If the LLM hallucinated a bad field type
    // or malformed structure, the parser catches it.
    const validated = parseSchema(parsed);

    if (!validated.success) {
      return {
        success: false,
        error: "LLM generated a schema that didn't pass validation. Try being more specific.",
        raw_output: cleaned.slice(0, 500),
        validation_errors: validated.errors,
      };
    }

    // ── Success ─────────────────────────────────────────
    return {
      success: true,
      schema: validated.data,
      model,
      prompt_tokens: data.usage?.prompt_tokens ?? 0,
      completion_tokens: data.usage?.completion_tokens ?? 0,
    };
  } catch (err) {
    return {
      success: false,
      error: `Failed to reach OpenRouter: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
