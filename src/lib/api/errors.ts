/**
 * Standardized API error responses.
 * Shape: { error: { code, message, details? } }
 */

import { NextResponse } from "next/server";

interface ErrorDetail {
  field?: string;
  message: string;
  suggestion?: string;
}

interface ApiError {
  error: {
    code: string;
    message: string;
    details?: ErrorDetail[];
  };
}

function errorResponse(status: number, code: string, message: string, details?: ErrorDetail[]): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details && details.length > 0 ? { details } : {}),
      },
    },
    { status }
  );
}

export function validationError(message: string, details?: ErrorDetail[]) {
  return errorResponse(400, "VALIDATION_ERROR", message, details);
}

export function schemaError(message: string, details?: ErrorDetail[]) {
  return errorResponse(400, "SCHEMA_ERROR", message, details);
}

export function dependencyCycleError(cyclePath: string[]) {
  return errorResponse(400, "DEPENDENCY_CYCLE", `Circular dependency detected: ${cyclePath.join(" → ")}`, [
    { message: `Tables involved: ${cyclePath.join(", ")}` },
  ]);
}

export function unauthorizedError(message = "Invalid or missing API key") {
  return errorResponse(401, "UNAUTHORIZED", message);
}

export function rateLimitError(message: string, details?: ErrorDetail[]) {
  return errorResponse(429, "RATE_LIMIT_EXCEEDED", message, [
    ...(details ?? []),
    { message: "Upgrade your plan or buy credits at https://mockhero.dev/pricing#credits" },
  ]);
}

export function payloadTooLargeError(message = "Request body too large. Maximum 1MB.") {
  return errorResponse(413, "PAYLOAD_TOO_LARGE", message);
}

export function internalError(message = "An unexpected error occurred") {
  return errorResponse(500, "INTERNAL_ERROR", message);
}

export function forbiddenFeatureError(feature: string, requiredTier: string) {
  return errorResponse(403, "FEATURE_REQUIRES_UPGRADE", `${feature} requires ${requiredTier} tier or above. Upgrade at https://mockhero.dev/pricing`);
}

export function serviceUnavailableError(message = "Service temporarily unavailable") {
  return errorResponse(503, "SERVICE_UNAVAILABLE", message);
}
