/**
 * Bulk job processing utility.
 * Reads a pending bulk_job from Supabase, runs the generation pipeline,
 * and writes the result (or error) back to the row.
 *
 * Consumed by POST /api/v1/generate/async for Scale-tier users.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { parseSchema } from "@/lib/engine/schema-parser";
import { generate } from "@/lib/engine/generator";
import { formatOutput } from "@/lib/engine/formatters";

export async function processBulkJob(jobId: string): Promise<void> {
  const supabase = createAdminClient();

  // 1. Read the job
  const { data: job, error: fetchError } = await supabase
    .from("bulk_jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (fetchError || !job) {
    console.error(`Bulk job ${jobId}: failed to fetch`, fetchError);
    return;
  }

  // 2. Mark as processing
  await supabase
    .from("bulk_jobs")
    .update({ status: "processing", started_at: new Date().toISOString() })
    .eq("id", jobId);

  try {
    // 3. Parse the schema from the stored request
    const parsed = parseSchema(job.request);

    if (!parsed.success) {
      await supabase
        .from("bulk_jobs")
        .update({
          status: "failed",
          error: `Schema validation failed: ${parsed.errors.map((e) => e.message).join("; ")}`,
          completed_at: new Date().toISOString(),
        })
        .eq("id", jobId);
      return;
    }

    // 4. Generate data
    const result = await generate(parsed.data);

    if (!result.success) {
      const errorMessage =
        "cycle" in result
          ? `Circular dependency detected: ${result.cycle.join(" -> ")}`
          : "errors" in result
            ? result.errors.map((e) => e.message).join("; ")
            : "Data generation failed";

      await supabase
        .from("bulk_jobs")
        .update({
          status: "failed",
          error: errorMessage,
          completed_at: new Date().toISOString(),
        })
        .eq("id", jobId);
      return;
    }

    // 5. Format the output
    const formatted = formatOutput(
      result.result,
      parsed.data.tables,
      parsed.data.format ?? "json",
      parsed.data.sql_dialect
    );

    // 6. Mark as completed with result
    await supabase
      .from("bulk_jobs")
      .update({
        status: "completed",
        result: formatted.body as Record<string, unknown>,
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Bulk job ${jobId}: processing failed`, err);

    await supabase
      .from("bulk_jobs")
      .update({
        status: "failed",
        error: message,
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);
  }
}
