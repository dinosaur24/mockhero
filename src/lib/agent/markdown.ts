import { MOCKHERO_AGENT_PROFILE } from "./profile";

export function renderLlmsTxt() {
  const p = MOCKHERO_AGENT_PROFILE;

  return `# ${p.name}

> ${p.summary}

## Key Facts

- Website: ${p.websiteUrl}
- API Base URL: ${p.apiBaseUrl}
- OpenAPI: ${p.openapiUrl}
- Agent Manifest: ${p.agentManifestUrl}
- Pricing: ${p.pricingUrl}
- Agent Checkout: ${p.agentCheckoutUrl}
- Capabilities: ${p.capabilitiesUrl}
- npm MCP Server: ${p.mcpPackage}
- Free tier: ${p.pricing.free.recordsPerDay.toLocaleString("en-US")} records/day, no credit card required

## Capabilities

${p.capabilities.map((capability) => `- ${capability}`).join("\n")}

## Authentication

Use \`${p.canonicalAuthHeader}\`. The API also accepts \`${p.alternateAuthHeader}\`.

## Core Endpoint

POST ${p.apiBaseUrl}/generate

## Agent Purchase

Use Polar Checkout for paid plans. Polar is the Merchant of Record for checkout, tax calculation, collection, and remittance.

- Agent checkout instructions: ${p.agentCheckoutUrl}
- New customers: ${p.payment.active.newCustomerUrl}
- Existing customers: ${p.payment.active.checkoutUrl}
- Authenticated checkout API: POST ${p.payment.active.authenticatedCheckoutApiUrl}
- Active payment protocol: ${p.payment.active.protocols.join(", ")}

## Links

- Full LLM reference: ${p.websiteUrl}/llms-full.txt
- API reference: ${p.websiteUrl}/docs/api-reference
- MCP docs: ${p.websiteUrl}/docs/mcp
- Field types: ${p.websiteUrl}/docs/field-types
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

- Free: ${p.pricing.free.recordsPerDay.toLocaleString("en-US")} records/day, ${p.pricing.free.recordsPerRequest} records/request, ${p.pricing.free.requestsPerMinute} req/min
- Pro: ${p.pricing.pro.recordsPerDay.toLocaleString("en-US")} records/day, ${p.pricing.pro.recordsPerRequest.toLocaleString("en-US")} records/request, ${p.pricing.pro.requestsPerMinute} req/min
- Scale: ${p.pricing.scale.recordsPerDay.toLocaleString("en-US")} records/day, ${p.pricing.scale.recordsPerRequest.toLocaleString("en-US")} records/request, ${p.pricing.scale.requestsPerMinute} req/min

## MCP Server

Install: \`npx ${p.mcpPackage}\`

Environment variable: \`MOCKHERO_API_KEY=mh_your_key\`

Tools: \`generate_test_data\`, \`detect_schema\`, \`list_field_types\`, \`list_templates\`, \`generate_from_template\`

## Trust Signals

- Privacy: ${p.trust.privacy}
- Data retention: ${p.trust.dataRetention}
- Health check: ${p.trust.healthUrl}
- Support: ${p.trust.supportEmail}
`;
}
