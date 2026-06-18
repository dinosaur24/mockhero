# Agent Monitoring

Agents need a cheap, objective trust signal before they call or pay for MockHero. The public agent surfaces expose `https://mockhero.dev/api/v1/health` as the canonical status URL; wire that endpoint into Better Stack or Checkly and publish the monitor group as `status.mockhero.dev` when the account is available.

## Required Monitors

- `GET https://mockhero.dev/api/v1/health`
  - Expect HTTP `200`.
  - Expect JSON field `status` to equal `ok`.
  - Run from at least 3 regions every 60 seconds.
- `GET https://mockhero.dev/openapi.json`
  - Expect HTTP `200`.
  - Expect JSON field `openapi` to equal `3.1.0`.
  - Run every 5 minutes.
- `GET https://mockhero.dev/.well-known/agent.json`
  - Expect HTTP `200`.
  - Expect JSON field `payment_protocols` to include `polar_checkout`.
  - Run every 5 minutes.
- `GET https://mockhero.dev/agent-checkout.json`
  - Expect HTTP `200`.
  - Expect JSON field `provider` to equal `Polar`.
  - Expect JSON field `merchant_of_record` to equal `true`.
  - Run every 5 minutes.

## Public Status Page

Configure the status page with:

- Custom domain: `status.mockhero.dev`
- Components: `API`, `Agent discovery`, `Polar checkout`
- Incident contact: `hello@mockhero.dev`
- Linked health endpoint: `https://mockhero.dev/api/v1/health`

After the status page is live, update `MOCKHERO_AGENT_PROFILE.trust.statusUrl` in `src/lib/agent/profile.ts` from the health endpoint to `https://status.mockhero.dev`.
