import { generateApiKey } from "@/lib/api/keys";
import {
  createAgentCheckoutSession,
  ingestAgentUsageEvent,
} from "@/lib/polar/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { AGENT_USAGE_PRICING } from "@/lib/utils/constants";

export class AgentBillingError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "AgentBillingError";
  }
}

interface AgentCheckoutRow {
  id: string;
  billing_email: string;
  agent_user_id: string;
  status: "pending" | "paid" | "claimed" | "expired";
  claimed_at: string | null;
  polar_customer_id: string | null;
  polar_subscription_id: string | null;
}

function randomHex(bytes: number): string {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://mockhero.dev";
}

function buildAgentUserId(checkoutId: string): string {
  return `agent_${checkoutId.replace(/-/g, "")}`;
}

export function normalizeAgentEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function agentUsagePricingResponse() {
  return {
    free_records_per_day: AGENT_USAGE_PRICING.freeRecordsPerDay,
    price_usd_per_100_records: AGENT_USAGE_PRICING.priceUsdPer100Records,
    billing: AGENT_USAGE_PRICING.billing,
  };
}

export function calculateAgentBillableRecords(params: {
  dailyUsedAfter: number;
  requestedRecords: number;
}): number {
  const dailyUsedAfter = Math.max(0, params.dailyUsedAfter);
  const requestedRecords = Math.max(0, params.requestedRecords);
  const dailyUsedBefore = Math.max(0, dailyUsedAfter - requestedRecords);
  const freeRecords = AGENT_USAGE_PRICING.freeRecordsPerDay;

  const billableBefore = Math.max(0, dailyUsedBefore - freeRecords);
  const billableAfter = Math.max(0, dailyUsedAfter - freeRecords);

  return Math.max(0, billableAfter - billableBefore);
}

export async function createAgentCheckout(params: {
  email: string;
}): Promise<{
  checkout_id: string;
  url: string;
  claim_url: string;
  claim_token: string;
  provider: "Polar";
  merchant_of_record: true;
  pricing: ReturnType<typeof agentUsagePricingResponse>;
}> {
  const email = normalizeAgentEmail(params.email);
  const checkoutId = crypto.randomUUID();
  const agentUserId = buildAgentUserId(checkoutId);
  const claimToken = `mh_claim_${randomHex(32)}`;
  const claimTokenHash = await sha256(claimToken);
  const appUrl = getAppUrl();

  const supabase = createAdminClient();
  const { error: insertError } = await supabase.from("agent_checkouts").insert({
    id: checkoutId,
    billing_email: email,
    agent_user_id: agentUserId,
    claim_token_hash: claimTokenHash,
    status: "pending",
  });

  if (insertError) {
    throw new AgentBillingError(500, "AGENT_CHECKOUT_CREATE_FAILED", "Failed to create agent checkout");
  }

  const checkout = await createAgentCheckoutSession({
    email,
    agentCheckoutId: checkoutId,
    agentUserId,
    claimUrl: `${appUrl}/api/agent/claim`,
  });

  await supabase
    .from("agent_checkouts")
    .update({ polar_checkout_id: checkout.id })
    .eq("id", checkoutId);

  return {
    checkout_id: checkoutId,
    url: checkout.url,
    claim_url: `${appUrl}/api/agent/claim`,
    claim_token: claimToken,
    provider: "Polar",
    merchant_of_record: true,
    pricing: agentUsagePricingResponse(),
  };
}

export async function claimAgentCheckout(token: string): Promise<{
  api_key: string;
  key_prefix: string;
  tier: "agent";
  usage: ReturnType<typeof agentUsagePricingResponse>;
}> {
  const claimTokenHash = await sha256(token);
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("agent_checkouts")
    .select("id, billing_email, agent_user_id, status, claimed_at, polar_customer_id, polar_subscription_id")
    .eq("claim_token_hash", claimTokenHash)
    .maybeSingle();

  if (error || !data) {
    throw new AgentBillingError(404, "AGENT_CHECKOUT_NOT_FOUND", "Agent checkout claim token was not found");
  }

  const checkout = data as AgentCheckoutRow;

  if (checkout.claimed_at || checkout.status === "claimed") {
    throw new AgentBillingError(409, "AGENT_CHECKOUT_ALREADY_CLAIMED", "This agent checkout has already been claimed");
  }

  if (checkout.status !== "paid") {
    throw new AgentBillingError(402, "PAYMENT_REQUIRED", "Polar checkout has not been paid yet");
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: checkout.agent_user_id,
      display_name: checkout.billing_email,
      tier: "agent",
    },
    { onConflict: "id" }
  );

  if (profileError) {
    throw new AgentBillingError(500, "AGENT_PROFILE_CREATE_FAILED", "Failed to provision agent profile");
  }

  const { rawKey, keyPrefix } = await generateApiKey(
    checkout.agent_user_id,
    "Agent API key"
  );

  const { error: updateError } = await supabase
    .from("agent_checkouts")
    .update({
      status: "claimed",
      claimed_at: new Date().toISOString(),
      api_key_prefix: keyPrefix,
    })
    .eq("id", checkout.id);

  if (updateError) {
    throw new AgentBillingError(500, "AGENT_CHECKOUT_CLAIM_FAILED", "Failed to mark agent checkout claimed");
  }

  return {
    api_key: rawKey,
    key_prefix: keyPrefix,
    tier: "agent",
    usage: agentUsagePricingResponse(),
  };
}

export async function recordAgentBillableUsage(params: {
  userId: string;
  apiKeyId: string;
  billableRecords: number;
  totalRecords: number;
}): Promise<void> {
  if (params.billableRecords <= 0) return;

  await ingestAgentUsageEvent({
    externalCustomerId: params.userId,
    billableRecords: params.billableRecords,
    totalRecords: params.totalRecords,
    externalId: `usage_${params.apiKeyId}_${Date.now()}_${randomHex(4)}`,
  });
}
