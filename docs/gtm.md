# Go-to-Market — MockHero

## 1. Market Context

The test data market has been asleep for a decade. Faker libraries shipped in 2012 and haven't fundamentally changed since. Mockaroo launched as a web UI when "SaaS" meant a form you fill out in your browser. Neither product was designed for a world where AI agents generate entire applications and need to verify their work against realistic data.

Three shifts make this the right moment for MockHero.

First, AI coding tools have crossed the adoption tipping point. Cursor has millions of downloads. Claude Code, Copilot, Lovable, and Bolt are growing exponentially. Every one of these tools generates code that touches databases, and every one of them needs test data to verify that code works. The number of "I need test data" moments is no longer growing linearly with developer headcount — it's multiplying with agent usage. This is a structural demand shift, not a trend.

Second, compliance pressure has eliminated the easiest path to realistic data. Teams that used to dump production databases into staging environments are now blocked by GDPR, HIPAA, and SOC2 audits. The compliance teams caught up. But the alternative — Faker's "John Doe at 123 Main St" — is so bad that many teams still copy prod and hope nobody notices. There's a vacuum between "obviously fake" and "illegally real" that MockHero fills perfectly.

Third, the developer tools market has trained buyers to pay for infrastructure that saves time. Supabase, Vercel, Resend, Neon — developers will pay $29/month without blinking if a tool eliminates recurring friction. Test data is exactly that kind of recurring friction: it happens 2-5 times per week for active developers, it's annoying every single time, and nobody has productized a real solution.

The addressable market starts with the estimated 30+ million active developers worldwide, but the sharper wedge is the subset using AI coding tools — likely 5-10 million today and growing fast. MockHero doesn't need to capture the entire market. Converting a tiny fraction of developers who hit the test data wall multiple times per week is enough to build a meaningful business.

---

## 2. Launch Strategy

The launch follows three phases designed for a solo founder with zero budget and strong distribution instincts. The phases overlap intentionally — pre-launch audience building continues through public launch.

**Phase 1: Pre-Launch (Weeks -8 to -1).** This phase is about building a small, engaged audience before there's anything to sell. The goal is 200-300 Twitter/X followers who care about developer tools, 50 email subscribers from a waitlist, and 10-15 beta testers who will use the API before public launch. Dino builds in public — sharing the frustrations that led to MockHero, posting code snippets of the generation engine, and showing before/after comparisons of Faker output vs MockHero output. Every post is a breadcrumb that makes the eventual launch feel like a payoff, not a cold pitch. The "Why Faker is broken" blog post is written and queued during this phase. The MCP server is published to npm in beta.

**Phase 2: Soft Launch (Week 0, days 1-3).** The API is live but not publicly announced. Beta testers get access, plus anyone Dino has been talking to on Twitter/X who expressed interest. The goal is 20-30 real users generating data against real schemas, surfacing bugs and UX friction before the spotlight hits. This is the stress test. If the API breaks, it breaks in front of 25 people, not 2,500. During soft launch, Dino monitors every API call, reads every schema submitted, and fixes issues in real time. The early adopter hook — 10,000 free records/day for the first 100 signups — is active but not yet promoted publicly.

**Phase 3: Public Launch (Week 0, days 4-7 through Week 1).** The full launch hits all channels within a 48-hour window: Hacker News "Show HN," Reddit (r/webdev, r/node, r/nextjs, r/programming), Indie Hackers, and Twitter/X. The blog post goes live. The early adopter offer (10x free tier) is the headline hook. Every piece of launch content drives to a single CTA: get a free API key and try the playground. The goal is 200 signups in the first week, with 50 making at least one API call beyond the playground.

---

## 3. Pre-Launch Playbook

**Weeks -8 to -6: Establish presence and seed the narrative.**

Start posting on Twitter/X 4-5 times per week. The content is not about MockHero — it's about the problem. Share specific frustrations: screenshots of Faker output that looks obviously fake, stories about seed scripts breaking after schema changes, observations about AI agents generating beautiful UIs but populating them with garbage data. Frame every post around the pain, not the solution. Target accounts to engage with: developers posting about Cursor, Claude Code, or Copilot; people complaining about test data; dev tool founders (Supabase, Resend, Neon communities). Engage genuinely — reply to threads, share useful takes, build name recognition. The goal by end of week -6 is 100 followers who associate Dino with "the test data problem."

Set up a minimal landing page with an email capture form. One headline ("Stop seeding your database with John Doe"), one paragraph explaining what's coming, one email field. This page exists to convert Twitter/X curiosity into a waitlist. Every post should link to it in the bio, not in the post itself — avoid looking promotional.

**Weeks -5 to -4: Build in public with substance.**

Shift content from pure problem-awareness to showing the solution taking shape. Post side-by-side comparisons: Faker output vs MockHero output for the same schema. Show the relational data engine working — "Here's 4 tables generated in one request, every foreign key valid." Share the locale data quality — German names, French addresses, Croatian phone numbers. These posts should make developers think "I want this" before they know it's available.

Write the blog post draft: "Why Faker is broken and what I built instead." This is the cornerstone content piece. Structure it as: (1) the specific ways Faker output fails in real projects, with code examples, (2) what "good" test data actually looks like, with MockHero output examples, (3) the relational data problem nobody else has solved, (4) a CTA to join the waitlist. Aim for 1,500-2,000 words. The tone is developer-to-developer, not marketing — Dino built this because he was annoyed, and here's why you should care.

Reach out to 5-10 developer-focused newsletter writers and Twitter/X accounts with 5K-50K followers. Don't ask for promotion — share the blog post draft and ask for feedback. Some will share it naturally when it publishes. The relationship matters more than the ask.

**Weeks -3 to -2: Beta testing and MCP server.**

Publish the MCP server to npm as a beta package. Post a thread on Twitter/X showing the MCP integration: a screen recording of Cursor using MockHero's MCP server to populate a database without the developer doing anything. This is the most shareable content in the pre-launch sequence — AI agents autonomously generating realistic test data is visually compelling and technically impressive.

Recruit 10-15 beta testers from the waitlist and Twitter/X conversations. Give them API keys and ask them to use MockHero with their actual project schemas. Set up a simple feedback channel — a shared Discord channel or even a group DM thread. The goal is real usage data: which field types get used most, how complex are real schemas, what errors do people hit, how fast is "fast enough." Beta feedback directly shapes the launch messaging — if every beta tester mentions relational data as the killer feature, that's the headline. If they all love locale quality, lead with that instead.

**Week -1: Final preparation.**

Finalize the blog post based on beta feedback and real usage examples. Prepare all launch content in advance: the Hacker News "Show HN" post (title + description), Reddit posts for each subreddit (tailored to each community's norms), the Indie Hackers launch post, and 5-7 Twitter/X posts to roll out over launch week. Draft responses to likely Hacker News comments: "How is this different from Faker?", "What about Mockaroo?", "Why would I pay for this?", "Does this work with [my database]?" Having these ready means faster, better responses during the launch window when every minute counts.

Test the signup flow end-to-end 10 times. Test the API with edge case schemas. Test the playground with slow connections. Fix everything that isn't smooth. The launch window is too valuable to waste on bugs that could have been caught.

Email the waitlist: "MockHero launches in 5 days. You're getting early access + 10,000 free records/day (10x the normal free tier) as a thank-you for being early. Reply to this email with your project and I'll personally make sure MockHero works for your use case."

---

## 4. Launch Week Plan

**Day 1 (Monday): Soft launch to waitlist and beta testers.**

Send the early access email at 9:00 AM. Include the API key, a link to the playground, and the early adopter benefit (10,000 records/day). Monitor signups, API calls, and error rates in real time. Respond to every question within 30 minutes. Post on Twitter/X: "MockHero is live for early access. 10,000 free records/day for the first 100 developers. Send a schema, get back realistic relational data in one API call." Pin this tweet. Goal: 30-50 signups, 15-20 making API calls.

**Day 2 (Tuesday): Publish the blog post.**

Publish "Why Faker is broken and what I built instead" on the MockHero blog (or a personal blog that links to MockHero). Share it on Twitter/X as a thread — don't just drop a link, pull out the 3 most compelling comparisons as standalone images or code blocks in the thread, with the link at the end. Share the post to Indie Hackers as a discussion, framing it as a build-in-public story. Email the newsletter writers you contacted during pre-launch with the live link. Goal: 500+ blog reads, 20 new signups from the post.

**Day 3 (Wednesday): Hacker News launch.**

Post the "Show HN" at 8:00-9:00 AM Eastern (peak HN traffic). Title format: "Show HN: MockHero -- Realistic, relational test data from a schema definition." The description should be concise: what it does (one sentence), why it exists (one sentence), what makes it different (relational data + MCP for AI agents), and a direct link to the playground. Ask 3-5 beta testers to visit the HN post and leave genuine comments about their experience — not fake reviews, but real feedback they'd share anyway. Monitor the post for the first 4 hours straight. Respond to every comment thoughtfully and quickly. HN values founders who engage. If the post hits the front page, expect 2,000-5,000 visits. If it doesn't, that's fine — the content still lives and gets search traffic. Goal: front page (stretch), 100+ signups from HN (realistic if it lands), 30+ signups (baseline).

**Day 4 (Thursday): Reddit push.**

Post to r/webdev and r/nextjs in the morning, r/node and r/programming in the afternoon. Each post is tailored to the subreddit's culture. For r/webdev: focus on the visual quality difference and the demo embarrassment problem. For r/nextjs: show a Next.js seed script using MockHero's API with code examples. For r/node: focus on the npm MCP server and programmatic usage. For r/programming: lead with the technical challenge of relational data generation and topological sorting. Never cross-post identical content. Reddit communities punish lazy marketing. Engage with every comment. Goal: 50+ combined signups from Reddit, at least one post gaining traction (50+ upvotes).

**Day 5 (Friday): Twitter/X thread and recap.**

Post a "launch week recap" thread on Twitter/X: what happened, what you learned, real usage numbers (if they're good), and a genuine reflection on what surprised you. Developers love transparency. Include a specific call to action: "If you haven't tried MockHero yet, the playground takes 10 seconds — no signup required." Share any interesting beta user stories or screenshots (with permission). Goal: the recap thread gets more engagement than the launch tweet because it has substance.

**Days 6-7 (Weekend): Rest, respond, fix.**

Don't launch new content. Respond to lingering comments on HN, Reddit, and Twitter/X. Fix any bugs that surfaced during the week. Review analytics: which channel drove the most signups? Which drove the most API usage (not just signups — actual usage)? What's the signup-to-first-API-call conversion rate? These numbers shape the post-launch strategy.

**Launch week metrics to watch:** Total signups, signups-to-first-API-call rate, API calls per user, multi-table schema usage percentage, error rate, MCP server npm installs, early adopter slots claimed (out of 100), traffic by source.

---

## 5. Post-Launch Growth

**Weeks 1-4: Validate and iterate.**

The first month is about learning, not scaling. The primary question is: are developers coming back? Track the day-1, day-7, and day-14 retention curves for API keys that made at least one call. If fewer than 30% of first-week users make a second API call in week 2, there's a retention problem to solve before investing in acquisition.

Publish one piece of content per week. Week 1: a tutorial ("Seed your Next.js app with realistic data in 60 seconds"). Week 2: a comparison post ("MockHero vs writing seed scripts: a real-world benchmark"). Week 3: an MCP deep-dive ("How AI agents use MockHero to test generated code"). Week 4: a user story (interview a beta tester about how they use MockHero). Each piece targets a different search intent and a different audience segment.

Ship improvements based on launch feedback. The most common requests from the first week should be addressed by week 3. Visible responsiveness to user feedback is a growth lever — developers share tools that feel actively maintained. Post changelogs publicly on Twitter/X. Every shipped feature is a content opportunity.

Implement Polar payment integration by end of week 2. The first paying customers should not have to wait. Manually upgrade any early users who request Pro during week 1 via Supabase, then migrate them to Polar. Announce Pro and Scale tiers publicly in week 3 with a simple pricing page.

**Weeks 5-8: Double down on what's working.**

By week 5, the data tells a story. If HN drove 60% of signups and Reddit drove 10%, don't waste time on Reddit — write another HN-worthy post. If the MCP server drives 25% of API traffic, invest in better agent integration and publish guides for Cursor and Claude Code setup. If relational data is the most-used feature, make it the center of every piece of content. Kill channels and messages that aren't performing. A solo founder can't afford to spread thin.

Launch the schema templates feature (e-commerce, blog, SaaS, social). These serve two purposes: they reduce time-to-value for new users, and each template is a piece of content. "Seed an e-commerce database with one API call" is a blog post, a Twitter/X thread, and a Reddit post.

Start collecting testimonials. Email every user who's made more than 10 API calls and ask: "How are you using MockHero? Would you be comfortable sharing a one-line quote?" Testimonials go on the landing page and into future launch content.

**Weeks 9-12: Scale acquisition, optimize conversion.**

If the product is retaining users and generating revenue, shift focus from experimentation to scaling what works. This means increasing content frequency on the top-performing channel to 2-3x/week, optimizing the signup-to-first-API-call funnel (where do people drop off?), and running the first paid experiments if organic growth is plateauing.

Publish the npm and Python SDK packages. SDKs reduce integration friction and create new distribution surfaces — the npm package page, PyPI page, and GitHub repos are all discoverable. Each SDK launch is a content event.

Submit MockHero to developer tool directories and curated lists: DevHunt, Product Hunt (for a second launch moment), StackShare, AlternativeTo (listed as an alternative to Mockaroo and Faker). These are low-effort, long-tail traffic sources.

Evaluate the 90-day targets: 500 registered developers, 50 weekly active, 15 paying, ~$400 MRR. If the numbers are tracking, maintain course. If they're behind, diagnose: is it an acquisition problem (not enough people finding MockHero), an activation problem (signups not making API calls), a retention problem (users trying once and leaving), or a monetization problem (users engaged but not paying)? Each diagnosis demands a different response.

---

## 6. Channel Strategy

Channels are ranked by expected ROI for a solo founder with zero budget selling a developer API. The ranking factors are: audience-product fit, cost, time investment, and speed to results.

**1. Hacker News (highest priority).**

Hacker News is the single most important channel for MockHero's launch. The audience is technically sophisticated developers who value craft, hate bloat, and will try a well-built tool immediately. A successful Show HN post can drive 2,000-5,000 visits in 24 hours — all from high-intent developers. The effort is concentrated: one post, 4 hours of active comment monitoring, and follow-up engagement. Expected timeline: results within 24-48 hours. The risk is binary — the post either gains traction or it doesn't — but the upside is asymmetric. Even a moderately successful HN post generates long-tail traffic for months. Plan for a second HN post 6-8 weeks after launch with a different angle (the MCP integration story, or a technical deep-dive on relational data generation).

**2. Twitter/X developer community (high priority, sustained effort).**

Twitter/X is the daily drumbeat. It's where developers discover tools through the people they follow, and where "build in public" narratives create compounding awareness. The effort is ongoing: 4-5 posts per week mixing problem-awareness content (test data frustrations), product showcases (before/after comparisons, new features), and build-in-public updates (usage numbers, lessons learned). Engage with developers posting about AI coding tools, test data problems, or competing tools. Expected timeline: slow build over 4-8 weeks, with occasional spikes from viral threads. The compounding effect is the real value — every follower gained pre-launch is a potential early adopter.

**3. MCP ecosystem and AI agent integration (high priority, strategic).**

This is not a traditional marketing channel but it's the most important distribution mechanism for MockHero's long-term thesis. Publishing the MCP server to npm, contributing to MCP tool directories, and writing setup guides for Cursor and Claude Code puts MockHero inside the developer's workflow without them visiting a website. Every agent that recommends MockHero is a zero-cost acquisition. The effort is front-loaded (build the MCP server, write the guides) with ongoing maintenance. Expected timeline: slow initial traction (weeks to months), but compounds aggressively as AI coding tools grow. Track MCP user agent traffic as a percentage of total API calls — this is the leading indicator for the agent distribution thesis.

**4. Reddit developer subreddits (medium priority).**

Reddit communities (r/webdev, r/node, r/nextjs, r/programming) are valuable but demanding. Each subreddit has different norms and aggressively punishes anything that smells like marketing. The content must be genuinely useful — tutorials, comparisons, technical deep-dives — with MockHero as a natural part of the story, not the pitch. Post at most once per subreddit per month to avoid being flagged as spam. Engage in comments on other people's posts about test data, database seeding, or AI coding. Expected timeline: bursts of traffic from individual posts, with unpredictable variance.

**5. SEO and content marketing (medium priority, long-term).**

Search traffic for terms like "realistic test data API," "generate fake data with relationships," "Faker alternative," and "synthetic test data generator" is modest but highly intentional. Every person searching these terms is actively looking for what MockHero does. The effort is creating 2-4 blog posts per month targeting these keywords, plus ensuring the landing page is optimized for core terms. Expected timeline: 3-6 months to see meaningful organic traffic. This is a slow-burn channel that pays off when everything else plateaus.

**6. Indie Hackers (lower priority, community building).**

Indie Hackers is valuable for the build-in-public narrative and connecting with other solo founders, but the audience skews more toward founders than developers. Use it for milestone updates, revenue transparency, and asking for feedback. Post the launch story and monthly updates. Expected timeline: small but engaged traffic spikes from each post.

**7. Developer newsletters (lower priority, opportunistic).**

Newsletters like TLDR, Bytes, JavaScript Weekly, and Node Weekly reach massive developer audiences. Getting featured requires either a compelling story or a direct relationship with the editor. The effort is writing a compelling pitch and sending it to 10-15 relevant newsletters. Conversion rates are unpredictable. Expected timeline: if accepted, a single newsletter feature can drive 500-2,000 visits. Worth pursuing after launch once there's a proven product and real usage numbers to cite.

---

## 7. Content Strategy

Content serves three functions for MockHero: acquisition (developers find MockHero through search and social), activation (content helps new users get to the magic moment faster), and authority (demonstrating deep expertise in test data builds trust).

**Cornerstone content (publish at launch, update quarterly).**

The "Why Faker is broken and what I built instead" blog post is the foundational piece. It targets developers who are already frustrated with Faker — the largest segment of potential MockHero users — and provides a direct comparison with code examples. This post should rank for "Faker alternative" and "better than Faker" search queries. Keep it updated as MockHero adds features.

A second cornerstone piece: "The complete guide to test data for AI-generated apps." This targets the emerging audience of developers using AI coding tools who don't even know they have a test data problem yet. It covers why AI agents need test data, what the current options are, and how MockHero's MCP server solves it. This positions MockHero at the center of a conversation that's just beginning.

**Recurring content (2x per month minimum).**

Tutorials tied to specific frameworks and use cases are the highest-leverage recurring content. Each tutorial targets a specific developer segment and a specific search query. Examples: "Seed a Supabase database with MockHero in 30 seconds," "Generate test data for your Next.js app," "Populate your PostgreSQL staging environment with synthetic data," "How to use MockHero with Prisma migrations." Every tutorial includes working code the reader can copy and run. Each one is a blog post, a Twitter/X thread, and a potential Reddit post — three channels from one piece of work.

Comparison posts are the second content type. "MockHero vs Faker: a side-by-side comparison," "Why seed scripts are costing you hours per week," "The compliance case for synthetic test data." These target developers in the consideration phase who are actively evaluating alternatives.

**Social content (4-5x per week on Twitter/X).**

Weekly rhythm: Monday — a "test data tip" or technique post (pure value, no promotion). Wednesday — a MockHero feature showcase with a code example or output screenshot. Friday — a build-in-public update (usage numbers, new feature shipped, lesson learned). Fill remaining slots with engagement — reply to threads about developer tools, test data, or AI coding. The ratio should feel like 70% genuine conversation and 30% product-related. Developers unfollow accounts that only self-promote.

**Content the audience creates (encourage and amplify).**

When users tweet about MockHero, retweet and engage. When someone writes a blog post or tutorial using MockHero, share it prominently. As the user base grows, user-generated content becomes the most trusted form of marketing. Seed this by making MockHero easy to write about — clear documentation, impressive output quality, and shareable comparison screenshots.

---

## 8. Community Strategy

MockHero's community strategy is participation-first, not platform-first. Building a Discord server or community forum on day one is a mistake for a solo founder — it creates an obligation to moderate and engage in a space that will feel empty for months. Instead, show up where developers already gather.

**Where the audience lives.**

The primary target audience — fullstack developers using AI coding tools — congregates in a few specific places: Twitter/X developer circles (especially around Cursor, Claude Code, and Vercel ecosystems), Reddit's programming subreddits, Hacker News, Discord servers for specific tools (Cursor Discord, Supabase Discord, Next.js Discord), and GitHub discussions. Dino should be a regular, helpful presence in 2-3 of these spaces — not a lurker who only shows up to promote, but someone who answers questions, shares insights, and builds genuine relationships.

**Engagement playbook.**

On Twitter/X: follow and engage with 50-100 developers who post about test data, database tooling, AI coding, or developer experience. Reply to their content with genuine value. When someone tweets about a seed script problem, reply with a helpful suggestion (not "use MockHero" — something actually useful). Over time, these developers become aware of Dino and MockHero organically. A few will try the product without being asked.

In Discord servers (Cursor, Supabase, Next.js): answer questions in help channels. When someone asks about test data or seed scripts, provide useful advice and mention MockHero where it's naturally relevant. This is a slow-burn strategy — one helpful answer today might convert a user in three months. Never spam. One promotional-adjacent message per week per server at most.

On GitHub: contribute to discussions in repositories related to database tooling, ORMs (Prisma, Drizzle), and testing frameworks. Open thoughtful issues or PRs where MockHero integration would be valuable. This builds credibility in the developer tooling ecosystem.

**When to build a community space.**

Launch a Discord server or GitHub Discussions space when there are at least 50 weekly active users who would benefit from talking to each other — not just to Dino. The trigger is seeing users ask each other questions on Twitter/X or in GitHub issues. Until then, a simple feedback channel (email or a single Discord channel) is sufficient for gathering input without the overhead of community management.

---

## 9. Key Metrics

All targets align with the 90-day goal: 500 registered developers, 50 weekly active, 15 paying, ~$400 MRR.

**Acquisition metrics:**

| Metric | 30-day target | 60-day target | 90-day target |
|--------|:------------:|:------------:|:------------:|
| Total registered users | 150 | 300 | 500 |
| Signups per week | 40 | 30 | 25 |
| MCP server npm installs | 50 | 120 | 200 |
| Blog post views (cumulative) | 2,000 | 5,000 | 10,000 |
| Traffic from organic search | 5% | 10% | 15% |

Signups per week are expected to spike at launch and normalize. The 90-day target of 25/week reflects sustainable organic growth, not launch spikes.

**Activation metrics:**

| Metric | Target | "Red flag" threshold |
|--------|:------:|:-------------------:|
| Signup to first API call (within 24h) | 50% | < 25% |
| First API call to second API call (within 7d) | 40% | < 20% |
| % of users who try multi-table schema | 30% | < 15% |
| Time from signup to magic moment | < 5 min | > 15 min |

Activation is the most important funnel stage for MockHero. If developers sign up but never make an API call, no amount of acquisition will fix the business. If the signup-to-first-call rate drops below 25%, the onboarding experience needs immediate attention.

**Retention metrics:**

| Metric | 30-day target | 60-day target | 90-day target |
|--------|:------------:|:------------:|:------------:|
| Weekly active API keys | 20 | 35 | 50 |
| Day-7 retention (made call in week 2) | 30% | 35% | 40% |
| Day-30 retention (made call in month 2) | 20% | 25% | 25% |
| Records generated per day | 50,000 | 100,000 | 200,000 |

Weekly active API keys is the north star metric. Everything else is diagnostic. If WAK is growing, the product is working. If WAK is flat while signups grow, there's a retention problem.

**Revenue metrics:**

| Metric | 30-day target | 60-day target | 90-day target |
|--------|:------------:|:------------:|:------------:|
| Paying customers | 3 | 8 | 15 |
| MRR | $60 | $200 | $400 |
| Free-to-paid conversion (30-day cohort) | 2% | 2.5% | 3% |
| Users hitting free tier limit | 10% | 12% | 15% |

Revenue is a trailing indicator at this stage. The conversion rate matters more than total MRR — it signals whether the free tier limits create genuine upgrade pressure and whether the paid value proposition is compelling.

**Leading indicators to watch daily during launch week, weekly after:**

- API calls from MCP user agents as a percentage of total (agent adoption signal — target: 10% by day 90)
- Schema complexity trend: average number of tables per request (growing complexity = deeper usage)
- Same-key repeat usage rate (are individual developers coming back?)
- Error rate on API calls (quality signal — target: below 2%)

---

## 10. Budget Considerations

MockHero launches with zero cash spend. This is a constraint that can also be a strength — it forces focus on organic, high-leverage activities and eliminates wasteful experimentation.

**Free infrastructure (month 1-2):**

- Vercel free tier: hosting, serverless functions, analytics. Sufficient for early traffic and API volume.
- Supabase free tier: PostgreSQL for auth, API keys, and usage tracking. 500 MB storage, 2 GB bandwidth, 50K monthly active users — more than enough.
- GitHub: code hosting, issue tracking, project management.
- Polar: no upfront cost, takes a percentage of revenue.
- npm: free MCP server package hosting.
- Email (personal or free tier of Resend/Loops): waitlist and launch emails.

Total cost for months 1-2: $0. This covers up to roughly 500 users and moderate API traffic.

**First paid investments (month 2-3, funded by early revenue):**

When MRR reaches $100-200, invest in a custom domain email ($5-10/month for a professional sender), Vercel Pro if traffic demands it ($20/month), and Supabase Pro if database limits are reached ($25/month). Total: $50-55/month, easily covered by 3 Pro tier customers.

**When to consider paid acquisition (month 3+, only if organic is working):**

Paid acquisition makes sense only after organic channels are validated and the activation funnel is healthy. A 50% signup-to-first-call rate and 3%+ free-to-paid conversion means paid traffic has a clear path to ROI. Start with $100-200/month on Twitter/X ads targeting developer audiences (keywords: test data, database seeding, Faker alternative). Test small, measure cost-per-activated-user (not cost-per-signup), and scale only what works. If the cost to acquire a paying customer exceeds $50 (about 2.5 months of Pro revenue), the economics don't work and organic should remain the sole focus.

**Things that are not worth paying for at this stage:** Influencer sponsorships (too expensive, wrong audience), conference booths (wrong format for a solo founder), PR agencies (the founder's authentic voice is more effective), and design agencies (the product quality and code examples are the brand).

---

## 11. Risks

**1. Hacker News launch underperforms (likelihood: medium, impact: high).**

HN is the single biggest launch lever, and whether a post gains traction is partially luck — timing, competition from other posts, and moderator decisions all play a role. If the Show HN doesn't reach the front page, launch week signups could be 50 instead of 200. Mitigation: don't put all eggs in the HN basket. Reddit posts and the blog post launch simultaneously as parallel bets. If the first HN post underperforms, try again 4-6 weeks later with a different angle (technical deep-dive on relational data generation works well as a second attempt). Many successful products had a quiet first HN post and a viral second one.

**2. The agent distribution thesis is premature (likelihood: medium, impact: medium).**

MCP is early. Cursor and Claude Code support it, but agent behavior with MCP tools is still unpredictable. Agents might construct invalid schemas, misuse the API, or simply not recommend MockHero without explicit user prompting. If MCP traffic is less than 5% of total API calls after 60 days, the agent-first distribution story isn't materializing yet. Mitigation: the product must stand on its own as a developer-facing API. The MCP server is a bonus distribution channel, not the only one. Track MCP adoption as a leading indicator but don't anchor the entire GTM on it. The agent story strengthens the narrative even if the direct traffic is small initially.

**3. Free tier is too generous, killing conversion (likelihood: medium, impact: medium).**

At 1,000 records/day, a developer working on one project at a time might never hit the limit. If fewer than 10% of active users hit the free tier ceiling in the first 60 days, upgrade pressure is too low. Mitigation: monitor limit-hit rates weekly. If the data shows the free tier is too generous, reduce it to 500 records/day for new signups (grandfather existing users). The early adopter 10,000 records/day offer for the first 100 signups creates a two-tier system that provides data on how usage patterns differ between generous and standard free tiers.

**4. Faker ecosystem responds with relational data support (likelihood: low-medium, impact: high).**

Faker is open source with active maintainers. If MockHero gains visible traction, a motivated contributor could build a relational data plugin. This wouldn't match MockHero's API-first architecture or MCP integration, but it would undercut the "Faker is broken" messaging. Mitigation: move fast. The first 90 days are about establishing MockHero as the recognized solution before competitors react. The MCP server and API-first approach create switching costs that a Faker plugin can't replicate. Deepen the relational engine and locale quality — these are hard to copy.

**5. Solo founder bottleneck on support and iteration (likelihood: high, impact: medium).**

During launch week and the first month, Dino is simultaneously fixing bugs, responding to user feedback, creating content, monitoring channels, and iterating on the product. This is unsustainable beyond 4-6 weeks at full intensity. Mitigation: ruthless prioritization. Automate what can be automated (error alerting, usage dashboards, changelog updates). Batch content creation — write 2 weeks of Twitter/X posts in one session. Set expectations with users: "Solo founder, shipping fast, response times may be 24-48 hours." Most developers respect this. Avoid the trap of building features nobody asked for — every hour of dev time should be driven by actual user feedback.

**6. The market is too small or too slow (likelihood: low, impact: high).**

If developers don't actually value test data quality enough to sign up for a new tool, the entire premise fails. MockHero isn't addressing an unknown pain — developers complain about test data constantly — but complaining and switching tools are different behaviors. Mitigation: the free tier and zero-friction signup (GitHub OAuth, instant API key) eliminate every excuse not to try it. If 500 people sign up in 90 days but only 10 make repeat API calls, the problem isn't awareness — it's that the product doesn't solve a real workflow pain. In that case, talk to the 10 repeat users, understand why they stuck around, and rebuild the positioning around what actually hooked them.

**7. Pricing is wrong in either direction (likelihood: medium, impact: medium).**

$29/month might be too high for indie developers or too low for teams that would happily pay $49. The free-to-paid conversion rate in the first 60 days is the signal. If conversion is above 5%, the price may be too low — test $29. If conversion is below 1.5% despite healthy usage, test a lower price point or a more generous free tier with a higher paid tier. Mitigation: Polar makes price changes easy. Plan to adjust pricing once in the first 90 days based on data. Never change prices for existing customers without notice — grandfathering builds trust.
