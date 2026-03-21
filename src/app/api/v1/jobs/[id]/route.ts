/**
 * GET /api/v1/jobs/:id
 * Check the status of an async bulk generation job.
 * Returns the result when completed.
 */

import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api/middleware";
import { unauthorizedError, forbiddenFeatureError } from "@/lib/api/errors";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await validateApiKey(request);
  if (!user) {
    return unauthorizedError();
  }

  if (user.tier !== "scale") {
    return forbiddenFeatureError("Async bulk generation", "Scale");
  }

  const { id } = await params;

  const supabase = createAdminClient();
  const { data: job, error } = await supabase
    .from("bulk_jobs")
    .select("id, status, records_total, result, error, created_at, started_at, completed_at")
    .eq("id", id)
    .eq("user_id", user.user_id)
    .single();

  if (error || !job) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Job not found" } },
      { status: 404 }
    );
  }

  const response: Record<string, unknown> = {
    job_id: job.id,
    status: job.status,
    records_total: job.records_total,
    created_at: job.created_at,
    started_at: job.started_at,
    completed_at: job.completed_at,
  };

  if (job.status === "completed" && job.result) {
    response.data = job.result;
  }

  if (job.status === "failed" && job.error) {
    // Use "failure_reason" to avoid colliding with the standard error envelope
    // shape { error: { code, message } } used by all other endpoints
    response.failure_reason = job.error;
  }

  return NextResponse.json(response);
}
