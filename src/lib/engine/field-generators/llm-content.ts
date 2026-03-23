/**
 * LLM-powered content generators: blog_post, blog_comment
 *
 * Uses OpenRouter API (same setup as prompt-to-schema) to generate
 * contextually relevant content. Batches all rows for a table into
 * a single LLM call, then serves from cache per row.
 *
 * Falls back gracefully to non-LLM generators when:
 *   - OPENROUTER_API_KEY is not set
 *   - The API call fails
 *   - The response can't be parsed
 */

import type { FieldGenerator, GeneratorContext } from "../types";
import { paragraphGenerator, sentenceGenerator } from "./content";

// ── Configuration ────────────────────────────────────────

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-2.0-flash-001";

// ── Cache ────────────────────────────────────────────────

/**
 * WeakMap keyed on ctx.tableData (unique object reference per generate() call).
 * Each entry maps field-type to an array of pre-generated strings.
 * Using WeakMap ensures automatic cleanup when tableData is GC'd.
 */
const _llmCache = new WeakMap<object, Record<string, string[]>>();

/**
 * Track in-flight promises so that row 0 triggers the LLM call and
 * subsequent rows await the same promise instead of making duplicate calls.
 */
const _pendingRequests = new WeakMap<object, Record<string, Promise<string[]>>>();

// ── OpenRouter call ──────────────────────────────────────

async function callOpenRouter(systemPrompt: string, userPrompt: string): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL;

  try {
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
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 16384,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

function parseJsonArray(raw: string): string[] | null {
  // Strip markdown code fences if present
  const cleaned = raw
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

// ── Context gathering ────────────────────────────────────

function gatherContext(ctx: GeneratorContext, fieldType: string): string {
  const hints: string[] = [];

  // Look for title/category fields in the current record to provide context
  const record = ctx.currentRecord;
  for (const [key, value] of Object.entries(record)) {
    if (typeof value === "string" && value.length > 0) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes("title") ||
        lowerKey.includes("category") ||
        lowerKey.includes("topic") ||
        lowerKey.includes("name")
      ) {
        hints.push(`${key}: "${value}"`);
      }
    }
  }

  if (fieldType === "blog_comment") {
    for (const key of Object.keys(record)) {
      if (key.toLowerCase().includes("post_id") || key.toLowerCase().includes("article_id")) {
        hints.push("These are comments on blog posts");
        break;
      }
    }
  }

  return hints.length > 0 ? `Context: ${hints.join(", ")}` : "";
}

// ── Batch generation ─────────────────────────────────────

const BATCH_SIZE = 100;

async function generateBlogPostBatch(count: number, context: string): Promise<string[]> {
  const batchSize = Math.min(count, BATCH_SIZE);
  const systemPrompt = `You are a content generator. Generate ${batchSize} unique, high-quality blog posts.
Each post should be 700-1000 words, well-structured with multiple paragraphs.
Topics should be diverse: technology, business, lifestyle, science, productivity, design, health, etc.
Write in a natural, engaging tone. Each post should feel like a real article.

Return ONLY a valid JSON array of strings. No markdown fences, no explanation.
Example format: ["First blog post content here...", "Second blog post content here..."]`;

  const userPrompt = context
    ? `Generate ${batchSize} blog posts. ${context}`
    : `Generate ${batchSize} diverse blog posts on various topics.`;

  const raw = await callOpenRouter(systemPrompt, userPrompt);
  if (!raw) return [];

  return parseJsonArray(raw) ?? [];
}

async function generateBlogCommentBatch(count: number, context: string): Promise<string[]> {
  const batchSize = Math.min(count, BATCH_SIZE);
  const systemPrompt = `You are a content generator. Generate ${batchSize} unique blog comments.
Each comment should be 1-3 sentences in a natural, conversational tone.
Mix of positive feedback, questions, constructive criticism, and brief opinions.
Make them feel like real user comments on blog posts.

Return ONLY a valid JSON array of strings. No markdown fences, no explanation.
Example format: ["Great article, thanks for sharing!", "I disagree with point 3..."]`;

  const userPrompt = context
    ? `Generate ${batchSize} blog comments. ${context}`
    : `Generate ${batchSize} diverse blog comments.`;

  const raw = await callOpenRouter(systemPrompt, userPrompt);
  if (!raw) return [];

  return parseJsonArray(raw) ?? [];
}

// ── Cache-or-generate logic ──────────────────────────────

async function getCachedOrGenerate(
  ctx: GeneratorContext,
  fieldType: string,
  generateFn: (count: number, context: string) => Promise<string[]>,
): Promise<string | null> {
  const cacheKey = ctx.tableData;

  // 1. Check if we already have cached values
  const cached = _llmCache.get(cacheKey);
  if (cached?.[fieldType] && cached[fieldType].length > 0) {
    return cached[fieldType][ctx.rowIndex % cached[fieldType].length] ?? null;
  }

  // 2. On first row, kick off the LLM request
  let pending = _pendingRequests.get(cacheKey);
  if (!pending) {
    pending = {};
    _pendingRequests.set(cacheKey, pending);
  }

  if (!pending[fieldType]) {
    const context = gatherContext(ctx, fieldType);
    pending[fieldType] = generateFn(BATCH_SIZE, context);
  }

  // 3. Await the (shared) promise
  try {
    const results = await pending[fieldType];
    if (results.length > 0) {
      const existingCache = _llmCache.get(cacheKey) ?? {};
      existingCache[fieldType] = results;
      _llmCache.set(cacheKey, existingCache);
      return results[ctx.rowIndex % results.length] ?? null;
    }
  } catch {
    // Fall through to null — caller will use fallback
  }

  return null;
}

// ── Fallback generators ──────────────────────────────────

function fallbackBlogPost(_params: Record<string, unknown>, ctx: GeneratorContext): string {
  // Generate multiple paragraphs as fallback
  const paragraphs: string[] = [];
  for (let i = 0; i < 5; i++) {
    paragraphs.push(paragraphGenerator({ min: 5, max: 8 }, ctx) as string);
  }
  return paragraphs.join("\n\n");
}

function fallbackBlogComment(_params: Record<string, unknown>, ctx: GeneratorContext): string {
  return sentenceGenerator({ min_words: 8, max_words: 20 }, ctx) as string;
}

// ── Exported generators ──────────────────────────────────

export const blogPostGenerator: FieldGenerator = async (params, ctx) => {
  const llmResult = await getCachedOrGenerate(ctx, "blog_post", generateBlogPostBatch);
  if (llmResult) return llmResult;
  return fallbackBlogPost(params, ctx);
};

export const blogCommentGenerator: FieldGenerator = async (params, ctx) => {
  const llmResult = await getCachedOrGenerate(ctx, "blog_comment", generateBlogCommentBatch);
  if (llmResult) return llmResult;
  return fallbackBlogComment(params, ctx);
};
