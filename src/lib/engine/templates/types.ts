import type { GenerateRequest, Locale, OutputFormat, SqlDialect } from "../types";

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  tables: string[]; // table names
  default_counts: Record<string, number>;
  schema: GenerateRequest;
}

export interface TemplateSummary {
  id: string;
  name: string;
  description: string;
  tables: string[];
  default_counts: Record<string, number>;
}

export interface TemplateGenerateOptions {
  template: string;
  locale?: Locale;
  scale?: number; // multiplier for all table counts
  format?: OutputFormat;
  sql_dialect?: SqlDialect;
  seed?: number;
}
