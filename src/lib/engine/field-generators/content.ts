/**
 * Content field generators: sentence, paragraph, title, slug, tag, review, image_url, file_path, json, array
 */

import type { FieldGenerator } from "../types";

// Realistic sentence templates — no stacked connectors
const SENTENCE_TEMPLATES = [
  "The {adj} {noun} {verb} the {noun2} {result}.",
  "We {verb} the {noun} to {goal}.",
  "After {gerund} the {noun}, {outcome}.",
  "The {noun} now {verb2} {amount} {comparative} than before.",
  "{person} {verb} the {adj} {noun} {timeframe}.",
  "Our {noun} {verb} {amount} {noun2} {timeframe}.",
  "The {adj} {noun} was {verb_past} to {goal}.",
  "By {gerund} the {noun}, we {verb} {result}.",
];

const SENT_PARTS: Record<string, string[]> = {
  adj: ["new", "updated", "core", "main", "primary", "automated", "internal", "custom", "shared", "critical"],
  noun: ["system", "platform", "service", "module", "pipeline", "workflow", "dashboard", "API", "database", "feature", "integration", "process", "interface", "report", "configuration"],
  noun2: ["performance", "reliability", "throughput", "latency", "accuracy", "efficiency", "coverage", "uptime", "capacity", "response time"],
  verb: ["improved", "optimized", "rebuilt", "launched", "deployed", "migrated", "scaled", "refactored", "configured", "updated"],
  verb2: ["handles", "processes", "supports", "delivers", "achieves", "maintains", "generates", "completes", "serves", "resolves"],
  verb_past: ["redesigned", "refactored", "upgraded", "consolidated", "streamlined", "reconfigured", "replaced", "restructured"],
  gerund: ["optimizing", "migrating", "upgrading", "rebuilding", "testing", "deploying", "analyzing", "monitoring", "consolidating", "refactoring"],
  goal: ["improve throughput", "reduce latency", "increase reliability", "simplify maintenance", "enable scaling", "support growth", "reduce costs", "improve security"],
  result: ["by 35%", "across all regions", "for enterprise clients", "in production", "during peak hours", "without downtime", "ahead of schedule"],
  outcome: ["performance improved significantly", "error rates dropped to near zero", "the team shipped on schedule", "deployment time was cut in half", "customer satisfaction increased", "costs were reduced by a third"],
  amount: ["3x more", "50% fewer", "twice as many", "significantly more", "10x faster", "far fewer"],
  comparative: ["faster", "more efficiently", "more reliably", "with fewer errors", "with higher throughput"],
  person: ["The team", "Engineering", "The backend team", "Our DevOps team", "The platform team"],
  timeframe: ["last quarter", "this sprint", "in two weeks", "over the weekend", "during the migration", "ahead of the deadline"],
};

export const sentenceGenerator: FieldGenerator = (params, ctx) => {
  const template = ctx.prng.pick(SENTENCE_TEMPLATES);
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => {
    const options = SENT_PARTS[key];
    return options ? ctx.prng.pick(options) : key;
  });
};

// Business-oriented short phrases for deal names, project titles, etc.
const CATCH_PHRASE_TEMPLATES = [
  "{action} {target}",
  "{target} {action2}",
  "Q{q} {action} {target}",
  "{adj2} {target} {action2}",
  "Annual {target} {action2}",
];

const CATCH_PARTS: Record<string, string[]> = {
  action: ["Enterprise", "Cloud", "Platform", "Infrastructure", "Digital", "Global", "Strategic", "Core", "Premium", "Custom"],
  action2: ["Renewal", "Migration", "Upgrade", "Expansion", "Implementation", "Onboarding", "Deployment", "Integration", "Consolidation", "Optimization"],
  target: ["License", "Support Contract", "Data Platform", "Security Suite", "Analytics Package", "API Access", "Storage Plan", "Compute Cluster", "SaaS Bundle", "DevOps Tooling"],
  adj2: ["Extended", "Priority", "Multi-Year", "Full-Stack", "Cross-Region", "High-Availability", "Enterprise-Grade", "Dedicated"],
  q: ["1", "2", "3", "4"],
};

export const catchPhraseGenerator: FieldGenerator = (_params, ctx) => {
  const template = ctx.prng.pick(CATCH_PHRASE_TEMPLATES);
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => {
    const options = CATCH_PARTS[key];
    return options ? ctx.prng.pick(options) : key;
  });
};

export const paragraphGenerator: FieldGenerator = (params, ctx) => {
  // If exact sentence count is specified via params.sentences, use that
  const exactCount = params.sentences as number | undefined;
  const minSentences = exactCount ?? (params.min as number) ?? 5;
  const maxSentences = exactCount ?? (params.max as number) ?? 8;
  const count = minSentences === maxSentences
    ? minSentences
    : ctx.prng.nextInt(minSentences, maxSentences);

  const sentences: string[] = [];
  for (let i = 0; i < count; i++) {
    sentences.push(sentenceGenerator({ min_words: 8, max_words: 16 }, ctx) as string);
  }

  return sentences.join(" ");
};

const TITLE_ADJECTIVES = [
  "Complete", "Essential", "Advanced", "Modern", "Practical",
  "Comprehensive", "Ultimate", "Quick", "Effective", "Simple",
  "Proven", "Strategic", "Innovative", "Powerful", "Smart",
];

const TITLE_TOPICS = [
  "Guide to API Design", "Approach to Testing", "Database Optimization Tips",
  "Strategies for Scale", "Framework Comparison", "Security Best Practices",
  "Performance Monitoring", "Developer Workflow", "Deployment Pipeline",
  "Architecture Patterns", "Code Review Process", "Team Collaboration",
  "Data Migration Strategy", "Authentication Methods", "Error Handling",
];

export const titleGenerator: FieldGenerator = (_params, ctx) => {
  const adj = ctx.prng.pick(TITLE_ADJECTIVES);
  const topic = ctx.prng.pick(TITLE_TOPICS);
  return `${adj} ${topic}`;
};

// Track seen slugs per generation batch to guarantee uniqueness.
// Keyed by the tableData reference (unique per generate() call).
const _slugSeen = new WeakMap<object, Set<string>>();

export const slugGenerator: FieldGenerator = (_params, ctx) => {
  // Get or create the seen-set for this generation batch
  let seen = _slugSeen.get(ctx.tableData);
  if (!seen) {
    seen = new Set<string>();
    _slugSeen.set(ctx.tableData, seen);
  }

  const title = titleGenerator({}, ctx) as string;
  let slug = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  // Deduplicate: append -2, -3, etc. if slug already exists in this batch
  if (seen.has(slug)) {
    let suffix = 2;
    while (seen.has(`${slug}-${suffix}`)) {
      suffix++;
    }
    slug = `${slug}-${suffix}`;
  }

  seen.add(slug);
  return slug;
};

const TAGS = [
  "javascript", "typescript", "react", "nextjs", "nodejs",
  "api", "database", "testing", "devops", "security",
  "performance", "design", "ux", "mobile", "cloud",
  "ai", "machine-learning", "data", "analytics", "automation",
  "tutorial", "guide", "best-practices", "tips", "review",
];

export const tagGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.pick(TAGS);
};

const REVIEW_TEMPLATES = [
  "Great product, exactly what I needed. {detail}",
  "Works well for our use case. {detail}",
  "Solid quality, would recommend. {detail}",
  "Does what it says. {detail} Will buy again.",
  "Exceeded my expectations. {detail}",
  "Good value for the price. {detail}",
  "Not bad, but could be better. {detail}",
  "Perfect for small teams. {detail}",
  "Easy to set up and use. {detail}",
  "Reliable and fast. {detail}",
];

const REVIEW_DETAILS = [
  "Setup took less than 5 minutes.",
  "The documentation is excellent.",
  "Customer support was very responsive.",
  "Been using it daily for 3 months now.",
  "Integrates perfectly with our existing stack.",
  "The API is clean and well-designed.",
  "Performance has been consistently good.",
  "Price is reasonable for what you get.",
  "Would love to see more customization options.",
  "The learning curve was minimal.",
];

export const reviewGenerator: FieldGenerator = (_params, ctx) => {
  const template = ctx.prng.pick(REVIEW_TEMPLATES);
  const detail = ctx.prng.pick(REVIEW_DETAILS);
  return template.replace("{detail}", detail);
};

export const imageUrlGenerator: FieldGenerator = (params, ctx) => {
  const width = (params.width as number) ?? 640;
  const height = (params.height as number) ?? 480;
  const id = ctx.prng.nextInt(1, 1000);
  return `https://picsum.photos/seed/${id}/${width}/${height}`;
};

const FILE_EXTENSIONS = ["pdf", "docx", "xlsx", "csv", "png", "jpg", "zip", "txt", "json"];
const FILE_PREFIXES = [
  "report", "invoice", "summary", "data", "export", "backup",
  "document", "analysis", "presentation", "screenshot",
];

export const filePathGenerator: FieldGenerator = (_params, ctx) => {
  const prefix = ctx.prng.pick(FILE_PREFIXES);
  const ext = ctx.prng.pick(FILE_EXTENSIONS);
  const year = ctx.prng.nextInt(2022, 2025);
  const quarter = ctx.prng.pick(["q1", "q2", "q3", "q4"]);
  return `/documents/${prefix}-${quarter}-${year}.${ext}`;
};

export const jsonGenerator: FieldGenerator = (params, ctx) => {
  // Generate a simple nested JSON object
  const keys = (params.keys as string[]) ?? ["key", "value", "active"];
  const obj: Record<string, unknown> = {};
  for (const key of keys) {
    if (key === "active" || key === "enabled") {
      obj[key] = ctx.prng.chance(0.7);
    } else if (key === "count" || key === "total") {
      obj[key] = ctx.prng.nextInt(0, 100);
    } else {
      obj[key] = `value_${ctx.prng.nextInt(1, 999)}`;
    }
  }
  return obj;
};

export const arrayGenerator: FieldGenerator = (params, ctx) => {
  const min = (params.min_length as number) ?? 1;
  const max = (params.max_length as number) ?? 5;
  const length = ctx.prng.nextInt(min, max);
  const values = (params.values as string[]) ?? TAGS;
  return Array.from({ length }, () => ctx.prng.pick(values));
};
