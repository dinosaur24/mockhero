import type { GenerateRequest } from "../types";
import type { TemplateDefinition, TemplateGenerateOptions, TemplateSummary } from "./types";
import { ecommerceTemplate } from "./ecommerce";
import { blogTemplate } from "./blog";
import { saasTemplate } from "./saas";
import { socialTemplate } from "./social";

export type { TemplateDefinition, TemplateSummary, TemplateGenerateOptions } from "./types";

// ── Registry ────────────────────────────────────────────

export const TEMPLATE_REGISTRY: Record<string, TemplateDefinition> = {
  ecommerce: ecommerceTemplate,
  blog: blogTemplate,
  saas: saasTemplate,
  social: socialTemplate,
};

// ── Public helpers ──────────────────────────────────────

/**
 * Returns a lightweight summary of every registered template.
 * The `schema` field is intentionally excluded to keep payloads small.
 */
export function listTemplates(): TemplateSummary[] {
  return Object.values(TEMPLATE_REGISTRY).map(
    ({ id, name, description, tables, default_counts }) => ({
      id,
      name,
      description,
      tables,
      default_counts,
    }),
  );
}

/**
 * Returns the full template definition for a given id, or undefined if not found.
 */
export function getTemplate(id: string): TemplateDefinition | undefined {
  return TEMPLATE_REGISTRY[id];
}

/**
 * Builds a `GenerateRequest` from a template, applying optional overrides.
 *
 * - `scale` multiplies every table's count (minimum 1 per table after scaling).
 * - `locale`, `format`, `sql_dialect`, and `seed` override the template defaults.
 */
export function generateFromTemplate(options: TemplateGenerateOptions): GenerateRequest {
  const template = TEMPLATE_REGISTRY[options.template];
  if (!template) {
    throw new Error(`Unknown template: "${options.template}"`);
  }

  const rawScale = options.scale ?? 1;
  if (rawScale < 0) {
    throw new Error(`Invalid scale: ${rawScale}. Scale must be a positive number (e.g. 0.5 for half, 2 for double).`);
  }
  const scale = Math.min(Math.max(rawScale, 0.01), 100);

  const tables = template.schema.tables.map((table) => ({
    ...table,
    count: Math.max(1, Math.round(table.count * scale)),
  }));

  const request: GenerateRequest = {
    ...template.schema,
    tables,
  };

  if (options.locale !== undefined) {
    request.locale = options.locale;
  }
  if (options.format !== undefined) {
    request.format = options.format;
  }
  if (options.sql_dialect !== undefined) {
    request.sql_dialect = options.sql_dialect;
  }
  if (options.seed !== undefined) {
    request.seed = options.seed;
  }

  return request;
}
