/**
 * Content field generators: sentence, paragraph, title, slug, tag, review, image_url, file_path, json, array
 */

import type { FieldGenerator } from "../types";

// Realistic word bank — not lorem ipsum
const SUBJECTS = [
  "The team", "Our platform", "The new feature", "This approach", "The system",
  "Performance", "The dashboard", "User feedback", "The API", "Testing",
  "The database", "Our customers", "The deployment", "This update", "Security",
  "The workflow", "Analytics", "The integration", "Our infrastructure", "The service",
];

const VERBS = [
  "improved", "enabled", "streamlined", "reduced", "optimized",
  "simplified", "enhanced", "delivered", "resolved", "accelerated",
  "automated", "scaled", "validated", "transformed", "supported",
  "achieved", "generated", "configured", "monitored", "deployed",
];

const OBJECTS = [
  "response times by 40%", "the onboarding experience", "data processing speed",
  "developer productivity", "customer satisfaction scores", "deployment frequency",
  "error rates significantly", "resource utilization", "the authentication flow",
  "cross-team collaboration", "real-time monitoring", "automated testing coverage",
  "the migration process", "API reliability", "user engagement metrics",
  "code quality standards", "the review process", "load balancing efficiency",
  "database query performance", "the notification system",
];

const CONNECTORS = [
  "Additionally,", "Furthermore,", "As a result,", "Meanwhile,",
  "In particular,", "Notably,", "Consequently,", "Similarly,",
  "On the other hand,", "In contrast,", "Moreover,", "However,",
];

export const sentenceGenerator: FieldGenerator = (params, ctx) => {
  const minWords = (params.min_words as number) ?? 8;
  const maxWords = (params.max_words as number) ?? 16;

  // Generate a coherent sentence from templates
  const subject = ctx.prng.pick(SUBJECTS);
  const verb = ctx.prng.pick(VERBS);
  const object = ctx.prng.pick(OBJECTS);
  let sentence = `${subject} ${verb} ${object}.`;

  // Pad if too short
  while (sentence.split(" ").length < minWords) {
    sentence = `${ctx.prng.pick(CONNECTORS)} ${sentence.charAt(0).toLowerCase() + sentence.slice(1)}`;
  }

  // Trim if too long
  const words = sentence.split(" ");
  if (words.length > maxWords) {
    sentence = words.slice(0, maxWords).join(" ");
    if (!sentence.endsWith(".")) sentence += ".";
  }

  return sentence;
};

export const paragraphGenerator: FieldGenerator = (params, ctx) => {
  const minSentences = (params.min as number) ?? 3;
  const maxSentences = (params.max as number) ?? 5;
  const count = ctx.prng.nextInt(minSentences, maxSentences);

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

export const slugGenerator: FieldGenerator = (_params, ctx) => {
  const title = titleGenerator({}, ctx) as string;
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
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
