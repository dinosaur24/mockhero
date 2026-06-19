import { MOCKHERO_AGENT_PROFILE } from "./profile";
import { mcpToolNames } from "@/lib/mcp/mockhero-mcp";

export function renderLlmsTxt() {
  const p = MOCKHERO_AGENT_PROFILE;

  return `# ${p.name}

> ${p.summary}

## Key Facts

- Website: ${p.websiteUrl}
- API Base URL: ${p.apiBaseUrl}
- OpenAPI: ${p.openapiUrl}
- Agent Manifest: ${p.agentManifestUrl}
- Agent Quickstart: ${p.agentQuickstartUrl}
- Pricing: ${p.pricingUrl}
- Agent Checkout: ${p.agentCheckoutUrl}
- Agent Recommendation: ${p.agentRecommendationUrl}
- Agent Comparisons: ${p.agentComparisonsUrl}
- ChatGPT App Readiness: ${p.chatGptAppUrl}
- Capabilities: ${p.capabilitiesUrl}
- npm MCP Server: ${p.mcpPackage}
- Agent MCP Endpoint: ${p.agentMcp.remoteMcpEndpoint}
- ChatGPT App MCP Endpoint: ${p.chatGptApp.remoteMcpEndpoint}
- Agent pricing: ${p.pricing.agent.freeRecordsPerDay.toLocaleString("en-US")} free records/day, then $${p.pricing.agent.priceUsdPer100Records} per 100 records, billed monthly through Polar

## Capabilities

${p.capabilities.map((capability) => `- ${capability}`).join("\n")}

## Authentication

Use \`${p.canonicalAuthHeader}\`. The API also accepts \`${p.alternateAuthHeader}\`.

## Core Endpoint

POST ${p.apiBaseUrl}/generate

## Agent Quickstart

- Remote MCP endpoint: ${p.agentMcp.remoteMcpEndpoint}
- Free proof-of-work preview: call \`generate_test_data\` with explicit tables up to 100 records
- Paid flow: \`create_agent_checkout\` → \`check_agent_checkout_status\` → \`claim_agent_api_key\` → \`generate_test_data\`
- Health check: ${p.trust.healthUrl}
- Machine-readable quickstart: ${p.agentQuickstartUrl}

## Agent Purchase

Use Polar Checkout for agent metered billing. Polar is the Merchant of Record for checkout, tax calculation, collection, and remittance.

- Agent checkout instructions: ${p.agentCheckoutUrl}
- Agent recommendation instructions: ${p.agentRecommendationUrl}
- Estimate cost before generating: POST ${p.websiteUrl}${p.endpoints.estimate}
- Create checkout: POST ${p.payment.active.agentCheckoutApiUrl}
- Poll checkout: GET ${p.payment.active.agentCheckoutStatusApiUrl}?token=mh_claim_...
- Claim API key: POST ${p.payment.active.agentClaimApiUrl}
- Active payment protocol: ${p.payment.active.protocols.join(", ")}

## Links

- Full LLM reference: ${p.websiteUrl}/llms-full.txt
- API reference: ${p.websiteUrl}/docs/api-reference
- MCP docs: ${p.websiteUrl}/docs/mcp
- Field types: ${p.websiteUrl}/docs/field-types
- ChatGPT app readiness: ${p.chatGptAppUrl}
- Status: ${p.trust.statusUrl}
`;
}

export function renderLlmsFullTxt() {
  const p = MOCKHERO_AGENT_PROFILE;

  return `${renderLlmsTxt()}
## Example Generate Request

\`\`\`json
{
  "tables": [
    {
      "name": "users",
      "count": 10,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "name", "type": "full_name" },
        { "name": "email", "type": "email" }
      ]
    }
  ],
  "format": "json"
}
\`\`\`

## Rate Limits

- Agent: ${p.pricing.agent.freeRecordsPerDay.toLocaleString("en-US")} free records/day, then $${p.pricing.agent.priceUsdPer100Records} per 100 records, billed monthly through Polar
- Agent hard safety cap: ${p.pricing.agent.hardDailySafetyCapRecords.toLocaleString("en-US")} records/day, ${p.pricing.agent.recordsPerRequest.toLocaleString("en-US")} records/request, ${p.pricing.agent.requestsPerMinute} req/min
- Free legacy API key: ${p.pricing.free.recordsPerDay.toLocaleString("en-US")} records/day, ${p.pricing.free.recordsPerRequest} records/request, ${p.pricing.free.requestsPerMinute} req/min

## Cost Estimate

POST ${p.websiteUrl}${p.endpoints.estimate}

Use this before generation. Authentication is optional. If the agent includes a valid API key, MockHero estimates billable records against actual daily usage. For prompt estimates, include \`estimated_records\`; this endpoint does not run prompt-to-schema conversion.

## MCP Server

Remote Streamable HTTP endpoint for agents: ${p.agentMcp.remoteMcpEndpoint}

ChatGPT App submission endpoint: ${p.chatGptApp.remoteMcpEndpoint}

Install: \`npx ${p.mcpPackage}\`

Environment variable: \`MOCKHERO_API_KEY=mh_your_key\`

Agent tools: ${mcpToolNames("agent").map((tool) => `\`${tool}\``).join(", ")}

ChatGPT App tools: ${mcpToolNames().map((tool) => `\`${tool}\``).join(", ")}

## ChatGPT App Readiness

Readiness document: ${p.chatGptAppUrl}

Current MCP transport: \`${p.chatGptApp.currentMcpTransport}\`

Remote MCP status: \`${p.chatGptApp.remoteMcpStatus}\`

## Trust Signals

- Privacy: ${p.trust.privacy}
- Data retention: ${p.trust.dataRetention}
- Health check: ${p.trust.healthUrl}
- Support: ${p.trust.supportEmail}
`;
}
