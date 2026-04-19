export type ArticleCategory = "Database" | "Framework" | "Use Case" | "AI";

export interface Article {
  slug: string;
  title: string;
  description: string;
  category: ArticleCategory;
  date: string;
  author: string;
  content: string;
}

export const articles: Article[] = [
  // DATABASE SEEDING
  {
    slug: "how-to-seed-supabase-with-test-data",
    title: "How to Seed Supabase with Realistic Test Data",
    description:
      "Learn how to populate your Supabase database with realistic, relational test data using the MockHero API. Includes a complete Node.js seed script.",
    category: "Database",
    date: "2026-03-18",
    author: "MockHero Team",
    content: `
<h2>The Problem</h2>
<p>Every Supabase project starts the same way: you create beautiful tables, define RLS policies, and then sit there staring at an empty database. Writing manual INSERT statements is tedious, and tools like Faker.js require you to build an entire seed script from scratch, handle relational foreign keys yourself, and hope the data looks realistic enough for demos.</p>
<p>If you are working with a team, the problem multiplies. Everyone ends up with a different local dataset, QA tests against stale fixtures, and staging environments look nothing like production.</p>

<h2>The Solution: MockHero API</h2>
<p>MockHero is a single API call that returns realistic, relationally-consistent test data. Define your schema with 156+ field types, add <code>ref</code> fields to connect tables, and get back JSON you can pipe directly into Supabase. No libraries to install, no generators to maintain.</p>

<h2>Quick Setup</h2>
<pre><code>curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "x-api-key: mh_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
  "tables": [
    {
      "name": "profiles",
      "count": 10,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "full_name", "type": "full_name" },
        { "name": "email", "type": "email" },
        { "name": "avatar_url", "type": "avatar_url" },
        { "name": "created_at", "type": "datetime" }
      ]
    },
    {
      "name": "posts",
      "count": 30,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "author_id", "type": "ref", "params": { "ref": "profiles.id" } },
        { "name": "title", "type": "sentence" },
        { "name": "body", "type": "paragraphs" },
        { "name": "published", "type": "boolean" }
      ]
    }
  ],
  "format": "json"
}'</code></pre>

<h2>Step-by-Step Guide</h2>
<h3>1. Install dependencies</h3>
<pre><code>npm install @supabase/supabase-js</code></pre>

<h3>2. Get your MockHero API key</h3>
<p>Sign up at <a href="https://mockhero.dev/sign-up">mockhero.dev/sign-up</a> and copy your API key from the dashboard. The free tier gives you 1,000 rows per month.</p>

<h3>3. Write the seed script</h3>
<p>Create a file called <code>seed.mjs</code> in your project root:</p>
<pre><code>import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const res = await fetch("https://api.mockhero.dev/api/v1/generate", {
  method: "POST",
  headers: {
    "x-api-key": process.env.MOCKHERO_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    tables: [
      {
        name: "profiles",
        count: 20,
        fields: [
          { name: "id", type: "uuid" },
          { name: "full_name", type: "full_name" },
          { name: "email", type: "email" },
          { name: "avatar_url", type: "avatar_url" },
          { name: "created_at", type: "datetime" },
        ],
      },
      {
        name: "posts",
        count: 50,
        fields: [
          { name: "id", type: "uuid" },
          { name: "author_id", type: "ref", params: { ref: "profiles.id" } },
          { name: "title", type: "sentence" },
          { name: "body", type: "paragraphs" },
          { name: "published", type: "boolean" },
        ],
      },
    ],
    format: "json",
  }),
});

const { data } = await res.json();

const { error: profilesError } = await supabase
  .from("profiles")
  .insert(data.profiles);
if (profilesError) console.error("Profiles error:", profilesError);

const { error: postsError } = await supabase
  .from("posts")
  .insert(data.posts);
if (postsError) console.error("Posts error:", postsError);

console.log(
  "Seeded", data.profiles.length, "profiles and",
  data.posts.length, "posts"
);</code></pre>

<h3>4. Run the script</h3>
<pre><code>node seed.mjs</code></pre>

<h3>5. Verify in Supabase Studio</h3>
<p>Open the Table Editor in your Supabase dashboard. You should see 20 profiles and 50 posts, each post correctly referencing a profile through the <code>author_id</code> foreign key.</p>

<h2>Complete Example</h2>
<p>The seed script above is complete and production-ready. For larger datasets, increase the <code>count</code> values and consider batching your Supabase inserts. MockHero handles the relational consistency automatically so every <code>author_id</code> maps to a real <code>profiles.id</code>.</p>

<h2>Why MockHero vs Faker / Manual Seeds</h2>
<ul>
<li><strong>Relational data out of the box</strong> &mdash; <code>ref</code> fields guarantee foreign keys match across tables, no manual wiring.</li>
<li><strong>No code to maintain</strong> &mdash; your seed logic is a JSON schema, not hundreds of lines of JavaScript.</li>
<li><strong>Deterministic seeds</strong> &mdash; pass a <code>seed</code> parameter to get the same data every time, great for CI.</li>
</ul>

<h2>Get Started</h2>
<p>MockHero offers a free tier with 1,000 rows per month, no credit card required. <a href="https://mockhero.dev/sign-up">Sign up here</a> and start seeding your Supabase project in under a minute.</p>
`,
  },
  {
    slug: "how-to-seed-neon-database-with-test-data",
    title: "How to Seed a Neon Database with Test Data",
    description:
      "Populate your Neon Postgres database with realistic relational test data using the MockHero API. Full seed script included.",
    category: "Database",
    date: "2026-03-18",
    author: "MockHero Team",
    content: `
<h2>The Problem</h2>
<p>Neon gives you serverless Postgres with branching, but every new branch starts empty. If you are building a feature that depends on realistic data, you have to either copy production (risky and slow) or write INSERT statements by hand. Neither approach scales when you need fresh data for each branch.</p>
<p>Faker libraries help, but they dump the relationship problem on you. You still have to generate users first, collect their IDs, then reference them when creating orders. One mistake and your foreign keys break.</p>

<h2>The Solution: MockHero API</h2>
<p>MockHero generates realistic, relationally-consistent test data in a single HTTP call. Define tables with 156+ field types, link them with <code>ref</code> fields, and get back JSON or SQL ready for Neon. No dependencies, no ORM required.</p>

<h2>Quick Setup</h2>
<pre><code>curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "x-api-key: mh_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
  "tables": [
    {
      "name": "customers",
      "count": 15,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "name", "type": "full_name" },
        { "name": "email", "type": "email" },
        { "name": "company", "type": "company_name" }
      ]
    },
    {
      "name": "invoices",
      "count": 40,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "customer_id", "type": "ref", "params": { "ref": "customers.id" } },
        { "name": "amount_cents", "type": "integer", "params": { "min": 1000, "max": 500000 } },
        { "name": "status", "type": "enum", "params": { "values": ["draft","sent","paid","overdue"] } },
        { "name": "issued_at", "type": "datetime" }
      ]
    }
  ],
  "format": "sql"
}'</code></pre>

<h2>Step-by-Step Guide</h2>
<h3>1. Install dependencies</h3>
<pre><code>npm install @neondatabase/serverless</code></pre>

<h3>2. Get your MockHero API key</h3>
<p>Sign up at <a href="https://mockhero.dev/sign-up">mockhero.dev/sign-up</a> and grab your key from the dashboard.</p>

<h3>3. Write the seed script</h3>
<p>Create <code>seed.mjs</code>:</p>
<pre><code>import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const res = await fetch("https://api.mockhero.dev/api/v1/generate", {
  method: "POST",
  headers: {
    "x-api-key": process.env.MOCKHERO_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    tables: [
      {
        name: "customers",
        count: 15,
        fields: [
          { name: "id", type: "uuid" },
          { name: "name", type: "full_name" },
          { name: "email", type: "email" },
          { name: "company", type: "company_name" },
        ],
      },
      {
        name: "invoices",
        count: 40,
        fields: [
          { name: "id", type: "uuid" },
          { name: "customer_id", type: "ref", params: { ref: "customers.id" } },
          { name: "amount_cents", type: "integer", params: { min: 1000, max: 500000 } },
          { name: "status", type: "enum", params: { values: ["draft","sent","paid","overdue"] } },
          { name: "issued_at", type: "datetime" },
        ],
      },
    ],
    format: "json",
  }),
});

const { data } = await res.json();

for (const c of data.customers) {
  await sql(
    "INSERT INTO customers (id, name, email, company) VALUES ($1, $2, $3, $4)",
    [c.id, c.name, c.email, c.company]
  );
}

for (const inv of data.invoices) {
  await sql(
    "INSERT INTO invoices (id, customer_id, amount_cents, status, issued_at) VALUES ($1, $2, $3, $4, $5)",
    [inv.id, inv.customer_id, inv.amount_cents, inv.status, inv.issued_at]
  );
}

console.log(
  "Seeded", data.customers.length, "customers and",
  data.invoices.length, "invoices"
);</code></pre>

<h3>4. Run it</h3>
<pre><code>node seed.mjs</code></pre>

<h3>5. Verify in the Neon console</h3>
<p>Open the SQL Editor in your Neon dashboard and run <code>SELECT * FROM invoices LIMIT 5;</code> to confirm the data landed correctly with valid foreign keys.</p>

<h2>Complete Example</h2>
<p>The script above seeds customers and invoices with proper foreign key references. For even simpler seeding, request <code>"format": "sql"</code> from MockHero and pipe the output directly into <code>psql</code>.</p>

<h2>Why MockHero vs Faker / Manual Seeds</h2>
<ul>
<li><strong>Branch-friendly</strong> &mdash; run the script against any Neon branch for instant realistic data.</li>
<li><strong>SQL output mode</strong> &mdash; get raw INSERT statements you can run directly, no driver needed.</li>
<li><strong>156+ field types</strong> &mdash; from <code>iban</code> to <code>avatar_url</code>, data looks production-real.</li>
</ul>

<h2>Get Started</h2>
<p>MockHero has a free tier with 1,000 rows/month. No credit card needed. <a href="https://mockhero.dev/sign-up">Sign up now</a> and seed your next Neon branch in seconds.</p>
`,
  },
  {
    slug: "how-to-seed-prisma-with-test-data",
    title: "How to Seed Prisma with Realistic Test Data",
    description:
      "Use the MockHero API to generate relational test data and seed your Prisma database in minutes. Complete prisma/seed.ts example included.",
    category: "Database",
    date: "2026-03-19",
    author: "MockHero Team",
    content: `
<h2>The Problem</h2>
<p>Prisma makes database access elegant, but its seed file (<code>prisma/seed.ts</code>) is your responsibility. Most developers end up writing hundreds of lines of <code>prisma.user.create()</code> calls with hardcoded data that looks nothing like production. Worse, you have to manually chain creates to maintain foreign key relationships.</p>
<p>Faker.js helps with realistic values, but it does not understand your Prisma schema. You still wire up every relation by hand, and the seed file grows into an unmaintainable monster.</p>

<h2>The Solution: MockHero API</h2>
<p>MockHero generates relationally-consistent data from a simple JSON schema. Use <code>ref</code> fields to describe foreign keys and get back perfectly linked records. Feed the JSON directly into your Prisma client.</p>

<h2>Quick Setup</h2>
<pre><code>curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "x-api-key: mh_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
  "tables": [
    {
      "name": "User",
      "count": 10,
      "fields": [
        { "name": "id", "type": "cuid" },
        { "name": "name", "type": "full_name" },
        { "name": "email", "type": "email" },
        { "name": "role", "type": "enum", "params": { "values": ["USER","ADMIN"] } }
      ]
    },
    {
      "name": "Post",
      "count": 30,
      "fields": [
        { "name": "id", "type": "cuid" },
        { "name": "authorId", "type": "ref", "params": { "ref": "User.id" } },
        { "name": "title", "type": "sentence" },
        { "name": "content", "type": "paragraphs" },
        { "name": "published", "type": "boolean" }
      ]
    }
  ],
  "format": "json"
}'</code></pre>

<h2>Step-by-Step Guide</h2>
<h3>1. Install dependencies</h3>
<pre><code>npm install -D tsx
npm install @prisma/client</code></pre>

<h3>2. Get your MockHero API key</h3>
<p>Sign up at <a href="https://mockhero.dev/sign-up">mockhero.dev/sign-up</a> and copy your API key.</p>

<h3>3. Write the seed script</h3>
<p>Create <code>prisma/seed.ts</code>:</p>
<pre><code>import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const res = await fetch("https://api.mockhero.dev/api/v1/generate", {
    method: "POST",
    headers: {
      "x-api-key": process.env.MOCKHERO_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tables: [
        {
          name: "User",
          count: 10,
          fields: [
            { name: "id", type: "cuid" },
            { name: "name", type: "full_name" },
            { name: "email", type: "email" },
            { name: "role", type: "enum", params: { values: ["USER", "ADMIN"] } },
          ],
        },
        {
          name: "Post",
          count: 30,
          fields: [
            { name: "id", type: "cuid" },
            { name: "authorId", type: "ref", params: { ref: "User.id" } },
            { name: "title", type: "sentence" },
            { name: "content", type: "paragraphs" },
            { name: "published", type: "boolean" },
          ],
        },
      ],
      format: "json",
    }),
  });

  const { data } = await res.json();

  for (const user of data.User) {
    await prisma.user.create({ data: user });
  }
  for (const post of data.Post) {
    await prisma.post.create({ data: post });
  }

  console.log("Seeded", data.User.length, "users and", data.Post.length, "posts");
}

main()
  .catch(console.error)
  .finally(() =&gt; prisma.$disconnect());</code></pre>

<h3>4. Configure Prisma to use the seed</h3>
<p>Add to your <code>package.json</code>:</p>
<pre><code>"prisma": {
  "seed": "tsx prisma/seed.ts"
}</code></pre>

<h3>5. Run the seed</h3>
<pre><code>npx prisma db seed</code></pre>

<h3>6. Verify</h3>
<pre><code>npx prisma studio</code></pre>
<p>Open Prisma Studio and browse the User and Post tables. Every post's <code>authorId</code> points to a valid user.</p>

<h2>Complete Example</h2>
<p>The <code>prisma/seed.ts</code> above is the complete example. It fetches data from MockHero and inserts it through the Prisma client, preserving all relationships defined by <code>ref</code> fields.</p>

<h2>Why MockHero vs Faker / Manual Seeds</h2>
<ul>
<li><strong>No seed file maintenance</strong> &mdash; your schema is a JSON payload, not 300 lines of TypeScript.</li>
<li><strong>Automatic relations</strong> &mdash; <code>ref</code> fields guarantee foreign keys resolve correctly.</li>
<li><strong>Works with any Prisma provider</strong> &mdash; PostgreSQL, MySQL, SQLite, MongoDB &mdash; data is just JSON.</li>
</ul>

<h2>Get Started</h2>
<p>Free tier, 1,000 rows/month, no credit card. <a href="https://mockhero.dev/sign-up">Sign up at mockhero.dev</a> and run <code>npx prisma db seed</code> with real data in minutes.</p>
`,
  },
  {
    slug: "how-to-seed-drizzle-orm-with-test-data",
    title: "How to Seed Drizzle ORM with Realistic Test Data",
    description:
      "Generate relational test data with the MockHero API and seed your Drizzle ORM project. Complete TypeScript seed script included.",
    category: "Database",
    date: "2026-03-19",
    author: "MockHero Team",
    content: `
<h2>The Problem</h2>
<p>Drizzle ORM is lightweight and type-safe, but it doesn't come with a built-in seed command. You are left writing raw <code>db.insert()</code> calls with fabricated data that looks nothing like what your app actually handles. Maintaining foreign key consistency between tables is entirely on you.</p>
<p>Most teams end up with a fragile seed script that breaks every time they add a column. The data itself is often a handful of "Test User 1, Test User 2" records that are useless for UI development or demos.</p>

<h2>The Solution: MockHero API</h2>
<p>MockHero returns production-quality test data from a single API call. Define your Drizzle tables as a MockHero schema, use <code>ref</code> fields for foreign keys, and get JSON back that maps directly to your Drizzle insert calls.</p>

<h2>Quick Setup</h2>
<pre><code>curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "x-api-key: mh_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
  "tables": [
    {
      "name": "teams",
      "count": 5,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "name", "type": "company_name" },
        { "name": "plan", "type": "enum", "params": { "values": ["free","pro","enterprise"] } }
      ]
    },
    {
      "name": "members",
      "count": 20,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "teamId", "type": "ref", "params": { "ref": "teams.id" } },
        { "name": "name", "type": "full_name" },
        { "name": "email", "type": "email" },
        { "name": "role", "type": "enum", "params": { "values": ["owner","admin","member"] } }
      ]
    }
  ],
  "format": "json"
}'</code></pre>

<h2>Step-by-Step Guide</h2>
<h3>1. Install dependencies</h3>
<pre><code>npm install drizzle-orm postgres
npm install -D drizzle-kit tsx</code></pre>

<h3>2. Get your MockHero API key</h3>
<p>Sign up at <a href="https://mockhero.dev/sign-up">mockhero.dev/sign-up</a>. The free tier includes 1,000 rows/month.</p>

<h3>3. Write the seed script</h3>
<p>Create <code>src/db/seed.ts</code>:</p>
<pre><code>import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { teams, members } from "./schema";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

async function seed() {
  const res = await fetch("https://api.mockhero.dev/api/v1/generate", {
    method: "POST",
    headers: {
      "x-api-key": process.env.MOCKHERO_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tables: [
        {
          name: "teams",
          count: 5,
          fields: [
            { name: "id", type: "uuid" },
            { name: "name", type: "company_name" },
            { name: "plan", type: "enum", params: { values: ["free","pro","enterprise"] } },
          ],
        },
        {
          name: "members",
          count: 20,
          fields: [
            { name: "id", type: "uuid" },
            { name: "teamId", type: "ref", params: { ref: "teams.id" } },
            { name: "name", type: "full_name" },
            { name: "email", type: "email" },
            { name: "role", type: "enum", params: { values: ["owner","admin","member"] } },
          ],
        },
      ],
      format: "json",
    }),
  });

  const { data } = await res.json();

  await db.insert(teams).values(data.teams);
  await db.insert(members).values(data.members);

  console.log("Seeded", data.teams.length, "teams and", data.members.length, "members");
  await client.end();
}

seed();</code></pre>

<h3>4. Run the seed</h3>
<pre><code>npx tsx src/db/seed.ts</code></pre>

<h3>5. Verify with Drizzle Studio</h3>
<pre><code>npx drizzle-kit studio</code></pre>
<p>Open Studio and check that every member's <code>teamId</code> references a real team.</p>

<h2>Complete Example</h2>
<p>The seed script above is the full working example. It fetches data from MockHero's API, then uses Drizzle's <code>db.insert()</code> to write teams and members with correct foreign key relationships.</p>

<h2>Why MockHero vs Faker / Manual Seeds</h2>
<ul>
<li><strong>Schema as config</strong> &mdash; change the JSON schema, not TypeScript code, when tables evolve.</li>
<li><strong>Batch-friendly</strong> &mdash; MockHero returns arrays ready for Drizzle's bulk <code>.values()</code> call.</li>
<li><strong>Deterministic output</strong> &mdash; pass a <code>seed</code> param for identical data across runs.</li>
</ul>

<h2>Get Started</h2>
<p>Free tier, no credit card. <a href="https://mockhero.dev/sign-up">Sign up at mockhero.dev</a> and seed your Drizzle project in under five minutes.</p>
`,
  },
  {
    slug: "how-to-seed-firebase-with-test-data",
    title: "How to Seed Firebase Firestore with Test Data",
    description:
      "Use the MockHero API to generate realistic test documents and seed your Firebase Firestore collections. Complete Node.js script included.",
    category: "Database",
    date: "2026-03-19",
    author: "MockHero Team",
    content: `
<h2>The Problem</h2>
<p>Firebase Firestore has no seed command. When you start a new project or reset the emulator, you are left clicking through the console to add documents by hand, or writing verbose scripts that call <code>doc().set()</code> dozens of times with hardcoded values.</p>
<p>For document databases, the challenge is worse than SQL. You need nested objects, arrays of references, and subcollections, and Faker.js knows nothing about Firestore's data model.</p>

<h2>The Solution: MockHero API</h2>
<p>MockHero generates realistic data for any schema you define, including nested objects. Use <code>ref</code> fields to link collections and get back JSON ready to write to Firestore with the Admin SDK.</p>

<h2>Quick Setup</h2>
<pre><code>curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "x-api-key: mh_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
  "tables": [
    {
      "name": "users",
      "count": 10,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "displayName", "type": "full_name" },
        { "name": "email", "type": "email" },
        { "name": "photoURL", "type": "avatar_url" },
        { "name": "createdAt", "type": "datetime" }
      ]
    },
    {
      "name": "messages",
      "count": 50,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "senderId", "type": "ref", "params": { "ref": "users.id" } },
        { "name": "text", "type": "sentence" },
        { "name": "sentAt", "type": "datetime" }
      ]
    }
  ],
  "format": "json"
}'</code></pre>

<h2>Step-by-Step Guide</h2>
<h3>1. Install dependencies</h3>
<pre><code>npm install firebase-admin</code></pre>

<h3>2. Get your MockHero API key</h3>
<p>Sign up at <a href="https://mockhero.dev/sign-up">mockhero.dev/sign-up</a> and grab your key.</p>

<h3>3. Write the seed script</h3>
<p>Create <code>seed.mjs</code>:</p>
<pre><code>import admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

const res = await fetch("https://api.mockhero.dev/api/v1/generate", {
  method: "POST",
  headers: {
    "x-api-key": process.env.MOCKHERO_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    tables: [
      {
        name: "users",
        count: 10,
        fields: [
          { name: "id", type: "uuid" },
          { name: "displayName", type: "full_name" },
          { name: "email", type: "email" },
          { name: "photoURL", type: "avatar_url" },
          { name: "createdAt", type: "datetime" },
        ],
      },
      {
        name: "messages",
        count: 50,
        fields: [
          { name: "id", type: "uuid" },
          { name: "senderId", type: "ref", params: { ref: "users.id" } },
          { name: "text", type: "sentence" },
          { name: "sentAt", type: "datetime" },
        ],
      },
    ],
    format: "json",
  }),
});

const { data } = await res.json();
const batch = db.batch();

for (const user of data.users) {
  batch.set(db.collection("users").doc(user.id), user);
}
for (const msg of data.messages) {
  batch.set(db.collection("messages").doc(msg.id), msg);
}

await batch.commit();
console.log("Seeded", data.users.length, "users and", data.messages.length, "messages");</code></pre>

<h3>4. Run it</h3>
<pre><code>GOOGLE_APPLICATION_CREDENTIALS=./service-account.json node seed.mjs</code></pre>

<h3>5. Verify in the Firebase console</h3>
<p>Open your Firestore console and browse the users and messages collections. Every message's <code>senderId</code> references a real user document.</p>

<h2>Complete Example</h2>
<p>The script above is the complete solution. It uses Firestore batched writes for efficiency and MockHero's <code>ref</code> fields to maintain referential integrity across collections.</p>

<h2>Why MockHero vs Faker / Manual Seeds</h2>
<ul>
<li><strong>Batch-ready JSON</strong> &mdash; MockHero returns arrays you can loop through directly.</li>
<li><strong>Emulator compatible</strong> &mdash; works identically against the Firestore emulator for local dev.</li>
<li><strong>No Firestore-specific library</strong> &mdash; MockHero is database-agnostic, so you keep the same workflow if you migrate.</li>
</ul>

<h2>Get Started</h2>
<p>Free tier, 1,000 rows/month, no credit card. <a href="https://mockhero.dev/sign-up">Sign up at mockhero.dev</a> and fill your Firestore in seconds.</p>
`,
  },
  {
    slug: "how-to-seed-mongodb-with-test-data",
    title: "How to Seed MongoDB with Realistic Test Data",
    description:
      "Generate realistic documents and seed your MongoDB database using the MockHero API. Includes a complete Node.js seed script with references.",
    category: "Database",
    date: "2026-03-19",
    author: "MockHero Team",
    content: `
<h2>The Problem</h2>
<p>MongoDB is schemaless, which sounds like freedom until you need to populate it with realistic test data. Without a schema, most developers default to <code>{ name: "Test User 1" }</code> and call it done. The result is a database that tells you nothing about how your app will look or perform in production.</p>
<p>If your collections reference each other (users and orders, for example), maintaining those references with Faker.js means generating one collection, collecting IDs, then passing them into the next. It is tedious and error-prone.</p>

<h2>The Solution: MockHero API</h2>
<p>MockHero takes a JSON schema with 156+ field types and <code>ref</code> fields for cross-collection references. One API call returns consistent, linked documents you can insert directly into MongoDB.</p>

<h2>Quick Setup</h2>
<pre><code>curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "x-api-key: mh_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
  "tables": [
    {
      "name": "users",
      "count": 10,
      "fields": [
        { "name": "_id", "type": "object_id" },
        { "name": "username", "type": "username" },
        { "name": "email", "type": "email" },
        { "name": "bio", "type": "sentence" }
      ]
    },
    {
      "name": "posts",
      "count": 30,
      "fields": [
        { "name": "_id", "type": "object_id" },
        { "name": "authorId", "type": "ref", "params": { "ref": "users._id" } },
        { "name": "title", "type": "sentence" },
        { "name": "body", "type": "paragraphs" },
        { "name": "tags", "type": "array", "params": { "itemType": "word", "min": 1, "max": 4 } }
      ]
    }
  ],
  "format": "json"
}'</code></pre>

<h2>Step-by-Step Guide</h2>
<h3>1. Install dependencies</h3>
<pre><code>npm install mongodb</code></pre>

<h3>2. Get your MockHero API key</h3>
<p>Sign up at <a href="https://mockhero.dev/sign-up">mockhero.dev/sign-up</a>.</p>

<h3>3. Write the seed script</h3>
<p>Create <code>seed.mjs</code>:</p>
<pre><code>import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_URI);
await client.connect();
const db = client.db("myapp");

const res = await fetch("https://api.mockhero.dev/api/v1/generate", {
  method: "POST",
  headers: {
    "x-api-key": process.env.MOCKHERO_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    tables: [
      {
        name: "users",
        count: 10,
        fields: [
          { name: "_id", type: "object_id" },
          { name: "username", type: "username" },
          { name: "email", type: "email" },
          { name: "bio", type: "sentence" },
        ],
      },
      {
        name: "posts",
        count: 30,
        fields: [
          { name: "_id", type: "object_id" },
          { name: "authorId", type: "ref", params: { ref: "users._id" } },
          { name: "title", type: "sentence" },
          { name: "body", type: "paragraphs" },
          { name: "tags", type: "array", params: { itemType: "word", min: 1, max: 4 } },
        ],
      },
    ],
    format: "json",
  }),
});

const { data } = await res.json();

await db.collection("users").insertMany(data.users);
await db.collection("posts").insertMany(data.posts);

console.log("Seeded", data.users.length, "users and", data.posts.length, "posts");
await client.close();</code></pre>

<h3>4. Run it</h3>
<pre><code>node seed.mjs</code></pre>

<h3>5. Verify in MongoDB Compass</h3>
<p>Open Compass and browse the users and posts collections. Every post's <code>authorId</code> matches a real user <code>_id</code>.</p>

<h2>Complete Example</h2>
<p>The script above is production-ready. MockHero's <code>ref</code> field guarantees every <code>authorId</code> maps to an existing user, and <code>insertMany</code> handles the batch write efficiently.</p>

<h2>Why MockHero vs Faker / Manual Seeds</h2>
<ul>
<li><strong>Cross-collection references</strong> &mdash; <code>ref</code> fields link documents without manual ID juggling.</li>
<li><strong>MongoDB-native types</strong> &mdash; use <code>object_id</code> for proper Mongo IDs out of the box.</li>
<li><strong>Bulk-insert ready</strong> &mdash; arrays map directly to <code>insertMany</code>.</li>
</ul>

<h2>Get Started</h2>
<p>Free tier, no credit card. <a href="https://mockhero.dev/sign-up">Sign up at mockhero.dev</a> and populate your MongoDB in minutes.</p>
`,
  },
  {
    slug: "how-to-seed-postgresql-with-test-data",
    title: "How to Seed PostgreSQL with Realistic Test Data",
    description:
      "Populate your PostgreSQL database with realistic relational test data using the MockHero API. SQL output mode for direct piping included.",
    category: "Database",
    date: "2026-03-20",
    author: "MockHero Team",
    content: `
<h2>The Problem</h2>
<p>PostgreSQL is the world's most advanced open source database, but seeding it with realistic test data is still a manual chore. You end up writing long INSERT statements, or building a script that generates random strings that look nothing like real names, emails, or addresses.</p>
<p>Handling foreign keys makes it worse. You need to insert the parent table first, collect the generated IDs, and then use those when inserting the child table. A single mistyped UUID and your seed script throws a constraint violation.</p>

<h2>The Solution: MockHero API</h2>
<p>MockHero generates realistic data for any PostgreSQL schema. Define tables, use 156+ field types, connect them with <code>ref</code> fields, and request SQL output to pipe directly into <code>psql</code>. No libraries, no scripts.</p>

<h2>Quick Setup</h2>
<pre><code>curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "x-api-key: mh_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
  "tables": [
    {
      "name": "departments",
      "count": 5,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "name", "type": "department" },
        { "name": "budget", "type": "decimal", "params": { "min": 50000, "max": 500000 } }
      ]
    },
    {
      "name": "employees",
      "count": 25,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "department_id", "type": "ref", "params": { "ref": "departments.id" } },
        { "name": "name", "type": "full_name" },
        { "name": "email", "type": "email" },
        { "name": "salary", "type": "integer", "params": { "min": 40000, "max": 150000 } },
        { "name": "hired_at", "type": "date_past" }
      ]
    }
  ],
  "format": "sql"
}'</code></pre>

<h2>Step-by-Step Guide</h2>
<h3>1. Prerequisites</h3>
<p>You need <code>psql</code> and <code>curl</code> installed. Both ship with most Linux and macOS distributions.</p>

<h3>2. Get your MockHero API key</h3>
<p>Sign up at <a href="https://mockhero.dev/sign-up">mockhero.dev/sign-up</a> and copy your key.</p>

<h3>3. Create your tables</h3>
<pre><code>CREATE TABLE departments (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  budget NUMERIC NOT NULL
);

CREATE TABLE employees (
  id UUID PRIMARY KEY,
  department_id UUID REFERENCES departments(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  salary INTEGER NOT NULL,
  hired_at DATE NOT NULL
);</code></pre>

<h3>4. Generate and insert data</h3>
<p>Use the curl command from Quick Setup. The <code>format: "sql"</code> option returns INSERT statements you pipe directly into <code>psql</code>.</p>

<h3>5. Verify</h3>
<pre><code>psql $DATABASE_URL -c "SELECT e.name, d.name AS dept FROM employees e JOIN departments d ON d.id = e.department_id LIMIT 5;"</code></pre>

<h2>Complete Example</h2>
<p>For a script-based approach, save the curl command to <code>seed.sh</code> and run it whenever you need fresh data. The SQL output mode means zero JavaScript dependencies.</p>

<h2>Why MockHero vs Faker / Manual Seeds</h2>
<ul>
<li><strong>Zero dependencies</strong> &mdash; SQL output pipes directly into <code>psql</code>, no Node.js required.</li>
<li><strong>Referential integrity</strong> &mdash; <code>ref</code> fields ensure every foreign key is valid.</li>
<li><strong>Production-quality values</strong> &mdash; real-looking names, emails, and dates instead of "test123".</li>
</ul>

<h2>Get Started</h2>
<p>Free tier, 1,000 rows/month. <a href="https://mockhero.dev/sign-up">Sign up at mockhero.dev</a> and pipe realistic data into your PostgreSQL database today.</p>
`,
  },
  {
    slug: "how-to-seed-mysql-with-test-data",
    title: "How to Seed MySQL with Realistic Test Data",
    description:
      "Generate and insert realistic test data into MySQL using the MockHero API. SQL output mode for direct piping into mysql CLI included.",
    category: "Database",
    date: "2026-03-20",
    author: "MockHero Team",
    content: `
<h2>The Problem</h2>
<p>MySQL powers millions of applications, but seeding a development database with realistic data is still surprisingly painful. Most developers resort to copying subsets of production (a compliance nightmare) or writing INSERT statements with placeholder values that tell you nothing about how the application will actually behave.</p>
<p>ORMs like Sequelize or TypeORM have seed features, but you still have to supply the data. Foreign key constraints mean you have to insert tables in the right order with matching IDs.</p>

<h2>The Solution: MockHero API</h2>
<p>MockHero generates realistic, relational test data from a simple JSON schema. Request <code>format: "sql"</code> and pipe the output directly into the <code>mysql</code> CLI, or use JSON with your ORM of choice.</p>

<h2>Quick Setup</h2>
<pre><code>curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "x-api-key: mh_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
  "tables": [
    {
      "name": "categories",
      "count": 8,
      "fields": [
        { "name": "id", "type": "auto_increment" },
        { "name": "name", "type": "word" },
        { "name": "description", "type": "sentence" }
      ]
    },
    {
      "name": "products",
      "count": 50,
      "fields": [
        { "name": "id", "type": "auto_increment" },
        { "name": "category_id", "type": "ref", "params": { "ref": "categories.id" } },
        { "name": "name", "type": "product_name" },
        { "name": "price", "type": "decimal", "params": { "min": 5, "max": 500 } },
        { "name": "sku", "type": "uuid" },
        { "name": "in_stock", "type": "boolean" }
      ]
    }
  ],
  "format": "sql"
}'</code></pre>

<h2>Step-by-Step Guide</h2>
<h3>1. Prerequisites</h3>
<p>You need the <code>mysql</code> CLI client and <code>curl</code>.</p>

<h3>2. Get your MockHero API key</h3>
<p>Sign up at <a href="https://mockhero.dev/sign-up">mockhero.dev/sign-up</a>.</p>

<h3>3. Create your tables</h3>
<pre><code>CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT,
  name VARCHAR(200) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  sku VARCHAR(50),
  in_stock BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);</code></pre>

<h3>4. Generate and insert</h3>
<p>Use the curl command above. The SQL output includes properly ordered INSERT statements that respect foreign keys.</p>

<h3>5. Verify</h3>
<pre><code>mysql -u root -p mydb -e "SELECT p.name, p.price, c.name AS category FROM products p JOIN categories c ON c.id = p.category_id LIMIT 5;"</code></pre>

<h2>Complete Example</h2>
<p>Save the curl command as <code>seed.sh</code> for repeatable seeding. The SQL output handles insert ordering so foreign key constraints are always satisfied.</p>

<h2>Why MockHero vs Faker / Manual Seeds</h2>
<ul>
<li><strong>Pipe and done</strong> &mdash; SQL output goes straight into <code>mysql</code> CLI, no code needed.</li>
<li><strong>Auto-ordered inserts</strong> &mdash; parent tables are inserted before children automatically.</li>
<li><strong>MySQL-compatible types</strong> &mdash; <code>auto_increment</code>, <code>decimal</code>, and <code>boolean</code> map natively.</li>
</ul>

<h2>Get Started</h2>
<p>Free tier, no credit card. <a href="https://mockhero.dev/sign-up">Sign up at mockhero.dev</a> and seed your MySQL database in one command.</p>
`,
  },

  // FRAMEWORK GUIDES
  {
    slug: "nextjs-test-data-generation",
    title: "Generate Test Data for Next.js Applications",
    description:
      "Learn how to generate realistic test data for your Next.js app using the MockHero API. Server Components, API routes, and seed scripts covered.",
    category: "Framework",
    date: "2026-03-20",
    author: "MockHero Team",
    content: `
<h2>The Problem</h2>
<p>Next.js apps need data at every layer: Server Components fetching from a database, API routes returning JSON, and client components rendering lists. During development, you either hardcode arrays of fake objects or spin up an entire backend just to see your UI with more than two rows of data.</p>
<p>This slows down frontend development and makes it impossible to test edge cases like empty states, long text, or paginated data without manual effort.</p>

<h2>The Solution: MockHero API</h2>
<p>MockHero generates realistic data via a simple POST request. Call it from a Server Component, a seed script, or an API route. With 156+ field types and relational <code>ref</code> fields, you get data that mirrors your production schema.</p>

<h2>Quick Setup</h2>
<pre><code>curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "x-api-key: mh_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
  "tables": [
    {
      "name": "products",
      "count": 20,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "name", "type": "product_name" },
        { "name": "price", "type": "decimal", "params": { "min": 10, "max": 200 } },
        { "name": "image", "type": "image_url" },
        { "name": "description", "type": "sentence" }
      ]
    }
  ],
  "format": "json"
}'</code></pre>

<h2>Step-by-Step Guide</h2>
<h3>1. Install dependencies</h3>
<p>No extra packages needed. Next.js has built-in <code>fetch</code> support in both Server and Client Components.</p>

<h3>2. Get your MockHero API key</h3>
<p>Sign up at <a href="https://mockhero.dev/sign-up">mockhero.dev/sign-up</a>. Store the key in <code>.env.local</code>:</p>
<pre><code>MOCKHERO_API_KEY=mh_your_api_key</code></pre>

<h3>3. Create a data-fetching utility</h3>
<p>Create <code>lib/mock-data.ts</code>:</p>
<pre><code>export async function generateMockData(schema: object) {
  const res = await fetch("https://api.mockhero.dev/api/v1/generate", {
    method: "POST",
    headers: {
      "x-api-key": process.env.MOCKHERO_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...schema, format: "json" }),
  });
  const json = await res.json();
  return json.data;
}</code></pre>

<h3>4. Use in a Server Component</h3>
<p>Call <code>generateMockData()</code> directly in your async page component and render the products.</p>

<h3>5. Use in a seed script</h3>
<p>For persistent data, create a seed script that writes MockHero data to your database (see our Prisma or Drizzle guides).</p>

<h3>6. Verify</h3>
<p>Run <code>npm run dev</code> and navigate to your products page. You should see realistic product cards.</p>

<h2>Complete Example</h2>
<p>The utility function and Server Component above form a complete working example. For production apps, use MockHero to seed your database once, then read from the database normally.</p>

<h2>Why MockHero vs Faker / Manual Seeds</h2>
<ul>
<li><strong>Server Component friendly</strong> &mdash; call the API directly from async components, no client-side JS.</li>
<li><strong>No build step</strong> &mdash; no installing Faker, no importing modules, just an HTTP call.</li>
<li><strong>Relational data</strong> &mdash; use <code>ref</code> fields to generate linked tables for complex UIs.</li>
</ul>

<h2>Get Started</h2>
<p>Free tier, 1,000 rows/month, no credit card. <a href="https://mockhero.dev/sign-up">Sign up at mockhero.dev</a> and fill your Next.js app with real data.</p>
`,
  },
  {
    slug: "react-mock-data-for-development",
    title: "Generate Mock Data for React Development",
    description:
      "Speed up React development with realistic mock data from the MockHero API. Custom hooks and component examples included.",
    category: "Framework",
    date: "2026-03-20",
    author: "MockHero Team",
    content: `
<h2>The Problem</h2>
<p>React development moves fast until you need realistic data. You create a beautiful card component, but testing it with <code>{ name: "Test", price: 0 }</code> tells you nothing about how it handles real content. Long names overflow, currency formatting breaks, and images are missing.</p>
<p>Most teams maintain a <code>mockData.ts</code> file with handcrafted objects. It works for one or two components but quickly becomes a bottleneck when the app grows.</p>

<h2>The Solution: MockHero API</h2>
<p>MockHero generates realistic data via API. Call it once during development, save the result, and import it into your components. Need different data? Change the schema and regenerate.</p>

<h2>Quick Setup</h2>
<pre><code>curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "x-api-key: mh_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
  "tables": [
    {
      "name": "users",
      "count": 8,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "name", "type": "full_name" },
        { "name": "avatar", "type": "avatar_url" },
        { "name": "email", "type": "email" },
        { "name": "role", "type": "enum", "params": { "values": ["admin","editor","viewer"] } }
      ]
    }
  ],
  "format": "json"
}'</code></pre>

<h2>Step-by-Step Guide</h2>
<h3>1. Install dependencies</h3>
<p>No special packages needed. If you are using Create React App, Vite, or Next.js, you already have <code>fetch</code>.</p>

<h3>2. Get your MockHero API key</h3>
<p>Sign up at <a href="https://mockhero.dev/sign-up">mockhero.dev/sign-up</a>. Store it in your <code>.env</code> file.</p>

<h3>3. Create a mock data generator script</h3>
<p>Create <code>scripts/generate-mocks.mjs</code>:</p>
<pre><code>import fs from "fs";

const res = await fetch("https://api.mockhero.dev/api/v1/generate", {
  method: "POST",
  headers: {
    "x-api-key": process.env.MOCKHERO_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    tables: [
      {
        name: "users",
        count: 20,
        fields: [
          { name: "id", type: "uuid" },
          { name: "name", type: "full_name" },
          { name: "avatar", type: "avatar_url" },
          { name: "email", type: "email" },
          { name: "role", type: "enum", params: { values: ["admin","editor","viewer"] } },
        ],
      },
    ],
    format: "json",
  }),
});

const { data } = await res.json();
fs.writeFileSync("src/mocks/users.json", JSON.stringify(data.users, null, 2));
console.log("Generated", data.users.length, "mock users");</code></pre>

<h3>4. Run and use the data</h3>
<pre><code>node scripts/generate-mocks.mjs</code></pre>

<h3>5. Import in your components</h3>
<p>Import the generated JSON file directly in your React components and render the data.</p>

<h3>6. Regenerate when your schema changes</h3>
<p>Update the field list in your script and re-run. Commit the generated JSON or add it to <code>.gitignore</code> depending on your workflow.</p>

<h2>Complete Example</h2>
<p>The generator script and component import above form the complete workflow. For dynamic data, call MockHero from a backend proxy to avoid exposing your API key in the browser.</p>

<h2>Why MockHero vs Faker / Manual Mocks</h2>
<ul>
<li><strong>Zero runtime dependencies</strong> &mdash; generate once, import JSON. No Faker in your bundle.</li>
<li><strong>Consistent across the team</strong> &mdash; commit the JSON and everyone sees the same UI.</li>
<li><strong>Edge case testing</strong> &mdash; generate 100 records to catch overflow and pagination bugs.</li>
</ul>

<h2>Get Started</h2>
<p>Free tier, no credit card. <a href="https://mockhero.dev/sign-up">Sign up at mockhero.dev</a> and give your React components real data.</p>
`,
  },
  {
    slug: "django-test-data-with-api",
    title: "Generate Test Data for Django with the MockHero API",
    description:
      "Seed your Django database with realistic test data using the MockHero API. Complete management command example included.",
    category: "Framework",
    date: "2026-03-21",
    author: "MockHero Team",
    content: `
<h2>The Problem</h2>
<p>Django has a built-in fixtures system, but maintaining JSON fixture files is painful. They rot as your models change, and the data inside them is usually lorem ipsum that does not help you build a convincing demo or catch real bugs.</p>
<p>Libraries like Factory Boy help, but they require defining a factory class for every model. For a project with 15 models, that is 15 factory classes to write and maintain.</p>

<h2>The Solution: MockHero API</h2>
<p>MockHero generates realistic data from a simple HTTP call. Define your Django models as a MockHero schema, hit the API, and write the JSON into your database through the ORM. No libraries to install on the Python side beyond <code>requests</code>.</p>

<h2>Quick Setup</h2>
<pre><code>curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "x-api-key: mh_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
  "tables": [
    {
      "name": "authors",
      "count": 5,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "name", "type": "full_name" },
        { "name": "email", "type": "email" },
        { "name": "bio", "type": "paragraphs" }
      ]
    },
    {
      "name": "articles",
      "count": 20,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "author_id", "type": "ref", "params": { "ref": "authors.id" } },
        { "name": "title", "type": "sentence" },
        { "name": "body", "type": "paragraphs" },
        { "name": "published_at", "type": "datetime" }
      ]
    }
  ],
  "format": "json"
}'</code></pre>

<h2>Step-by-Step Guide</h2>
<h3>1. Install dependencies</h3>
<pre><code>pip install requests</code></pre>

<h3>2. Get your MockHero API key</h3>
<p>Sign up at <a href="https://mockhero.dev/sign-up">mockhero.dev/sign-up</a>.</p>

<h3>3. Create a management command</h3>
<p>Create <code>myapp/management/commands/seed.py</code> that calls the MockHero API and uses Django ORM to insert the returned records.</p>

<h3>4. Run the command</h3>
<pre><code>python manage.py seed</code></pre>

<h3>5. Verify in Django admin</h3>
<p>Open <code>/admin/</code> and browse your models. All articles reference valid authors.</p>

<h2>Complete Example</h2>
<p>The management command pattern works for any Django project. It fetches data from MockHero and inserts it through the ORM, handling relationships via <code>ref</code> fields.</p>

<h2>Why MockHero vs Factory Boy / Fixtures</h2>
<ul>
<li><strong>No factory classes</strong> &mdash; define schemas in JSON, not Python classes.</li>
<li><strong>Always fresh</strong> &mdash; no stale fixture files to update when models change.</li>
<li><strong>Language-agnostic</strong> &mdash; the same API works for your Django backend and React frontend.</li>
</ul>

<h2>Get Started</h2>
<p>Free tier, 1,000 rows/month. <a href="https://mockhero.dev/sign-up">Sign up at mockhero.dev</a> and run <code>python manage.py seed</code> in minutes.</p>
`,
  },
  {
    slug: "laravel-fake-data-generation",
    title: "Generate Fake Data for Laravel with the MockHero API",
    description:
      "Replace Faker factories with the MockHero API for realistic, relational test data in Laravel. Complete Artisan command included.",
    category: "Framework",
    date: "2026-03-21",
    author: "MockHero Team",
    content: `
<h2>The Problem</h2>
<p>Laravel ships with model factories and Faker, which is great until you need relational data. You define a UserFactory and a PostFactory, but connecting them requires <code>afterCreating</code> callbacks, state methods, and careful orchestration. For a real app with 10+ models, the factory system becomes hard to maintain.</p>
<p>Faker itself generates random data that often fails validation. Email domains do not resolve, phone numbers have wrong formats, and addresses mix countries with zip codes.</p>

<h2>The Solution: MockHero API</h2>
<p>MockHero generates validated, relational data in one API call. Define your models as a MockHero schema, use <code>ref</code> fields for foreign keys, and get back JSON you can insert through Eloquent.</p>

<h2>Quick Setup</h2>
<pre><code>curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "x-api-key: mh_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
  "tables": [
    {
      "name": "users",
      "count": 10,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "name", "type": "full_name" },
        { "name": "email", "type": "email" },
        { "name": "created_at", "type": "datetime" }
      ]
    },
    {
      "name": "posts",
      "count": 30,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "user_id", "type": "ref", "params": { "ref": "users.id" } },
        { "name": "title", "type": "sentence" },
        { "name": "body", "type": "paragraphs" },
        { "name": "status", "type": "enum", "params": { "values": ["draft","published","archived"] } }
      ]
    }
  ],
  "format": "json"
}'</code></pre>

<h2>Step-by-Step Guide</h2>
<h3>1. Install dependencies</h3>
<p>Laravel includes Guzzle by default. No extra packages needed.</p>

<h3>2. Get your MockHero API key</h3>
<p>Sign up at <a href="https://mockhero.dev/sign-up">mockhero.dev/sign-up</a> and add the key to your <code>.env</code>.</p>

<h3>3. Create an Artisan command</h3>
<p>Run <code>php artisan make:command SeedFromMockHero</code> and write a command that calls MockHero's API and inserts the data through Eloquent models.</p>

<h3>4. Run it</h3>
<pre><code>php artisan seed:mockhero</code></pre>

<h3>5. Verify</h3>
<p>Open Tinker or your admin panel to confirm the data was inserted with proper relationships.</p>

<h2>Complete Example</h2>
<p>The Artisan command replaces factories and seeders with a single API call that handles relational consistency through <code>ref</code> fields.</p>

<h2>Why MockHero vs Faker / Factories</h2>
<ul>
<li><strong>No factory maintenance</strong> &mdash; schema changes are JSON updates, not PHP refactors.</li>
<li><strong>Relational out of the box</strong> &mdash; <code>ref</code> fields replace complex <code>afterCreating</code> callbacks.</li>
<li><strong>Consistent data</strong> &mdash; pass a <code>seed</code> parameter for deterministic output across environments.</li>
</ul>

<h2>Get Started</h2>
<p>Free tier, no credit card. <a href="https://mockhero.dev/sign-up">Sign up at mockhero.dev</a> and seed your Laravel app in one Artisan command.</p>
`,
  },
  {
    slug: "rails-seed-data-with-api",
    title: "Seed Rails with Realistic Test Data via API",
    description:
      "Use the MockHero API to generate relational test data for your Rails application. Complete db/seeds.rb example included.",
    category: "Framework",
    date: "2026-03-21",
    author: "MockHero Team",
    content: `
<h2>The Problem</h2>
<p>Rails has <code>db/seeds.rb</code>, but most seed files are a mess of <code>create!</code> calls with hardcoded strings. Gems like Faker help with realistic values, but they do not manage foreign key relationships for you. You still manually chain creates and pass IDs between models.</p>
<p>For a typical Rails app with users, posts, and comments, that means three nested loops with careful ordering. Miss one association and your seed file crashes.</p>

<h2>The Solution: MockHero API</h2>
<p>MockHero generates linked, realistic data from a single HTTP call. Define your Rails models as a MockHero schema, use <code>ref</code> fields for associations, and insert the JSON through ActiveRecord.</p>

<h2>Quick Setup</h2>
<pre><code>curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "x-api-key: mh_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
  "tables": [
    {
      "name": "users",
      "count": 8,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "name", "type": "full_name" },
        { "name": "email", "type": "email" }
      ]
    },
    {
      "name": "posts",
      "count": 24,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "user_id", "type": "ref", "params": { "ref": "users.id" } },
        { "name": "title", "type": "sentence" },
        { "name": "body", "type": "paragraphs" },
        { "name": "published_at", "type": "datetime" }
      ]
    }
  ],
  "format": "json"
}'</code></pre>

<h2>Step-by-Step Guide</h2>
<h3>1. Install dependencies</h3>
<p>Add <code>gem "httparty"</code> to your Gemfile and run <code>bundle install</code>.</p>

<h3>2. Get your MockHero API key</h3>
<p>Sign up at <a href="https://mockhero.dev/sign-up">mockhero.dev/sign-up</a>.</p>

<h3>3. Write the seed script</h3>
<p>Edit <code>db/seeds.rb</code> to call the MockHero API and loop through the response, creating records with <code>User.create!</code> and <code>Post.create!</code>.</p>

<h3>4. Run it</h3>
<pre><code>rails db:seed</code></pre>

<h3>5. Verify in Rails console</h3>
<pre><code>rails console
Post.first.user.name</code></pre>

<h2>Complete Example</h2>
<p>The <code>db/seeds.rb</code> calls MockHero's API and inserts users and posts with valid foreign key references through ActiveRecord.</p>

<h2>Why MockHero vs Faker / FactoryBot</h2>
<ul>
<li><strong>No factories to write</strong> &mdash; JSON schema replaces Ruby factory classes.</li>
<li><strong>Associations handled</strong> &mdash; <code>ref</code> fields replace <code>association :user</code> wiring.</li>
<li><strong>CI-friendly</strong> &mdash; deterministic seeds with the <code>seed</code> parameter for reproducible test suites.</li>
</ul>

<h2>Get Started</h2>
<p>Free tier, 1,000 rows/month. <a href="https://mockhero.dev/sign-up">Sign up at mockhero.dev</a> and run <code>rails db:seed</code> with production-quality data.</p>
`,
  },
  {
    slug: "express-test-data-for-apis",
    title: "Generate Test Data for Express.js APIs",
    description:
      "Seed your Express.js API with realistic test data using MockHero. Complete seed script and middleware example included.",
    category: "Framework",
    date: "2026-03-21",
    author: "MockHero Team",
    content: `
<h2>The Problem</h2>
<p>Express APIs need test data for development, demos, and testing. Without a seeded database, your GET endpoints return empty arrays and your frontend developers are blocked. Building a seed script means picking a Faker library, wiring up database connections, handling foreign keys manually, and hoping the data looks realistic enough.</p>
<p>For API-first teams, the problem compounds. You need consistent data across services, and each service has its own seed script with its own bugs.</p>

<h2>The Solution: MockHero API</h2>
<p>MockHero is itself an API, so it fits naturally into Express workflows. One HTTP call returns JSON you can write to any database or return directly as a mock endpoint during development.</p>

<h2>Quick Setup</h2>
<pre><code>curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "x-api-key: mh_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
  "tables": [
    {
      "name": "customers",
      "count": 10,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "name", "type": "full_name" },
        { "name": "email", "type": "email" },
        { "name": "plan", "type": "enum", "params": { "values": ["starter","growth","enterprise"] } }
      ]
    },
    {
      "name": "orders",
      "count": 30,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "customer_id", "type": "ref", "params": { "ref": "customers.id" } },
        { "name": "total", "type": "decimal", "params": { "min": 10, "max": 500 } },
        { "name": "status", "type": "enum", "params": { "values": ["pending","shipped","delivered"] } }
      ]
    }
  ],
  "format": "json"
}'</code></pre>

<h2>Step-by-Step Guide</h2>
<h3>1. Install dependencies</h3>
<pre><code>npm install express better-sqlite3</code></pre>

<h3>2. Get your MockHero API key</h3>
<p>Sign up at <a href="https://mockhero.dev/sign-up">mockhero.dev/sign-up</a>.</p>

<h3>3. Write the seed script</h3>
<p>Create <code>seed.mjs</code> that creates SQLite tables, fetches data from MockHero, and inserts the records.</p>

<h3>4. Run it</h3>
<pre><code>node seed.mjs</code></pre>

<h3>5. Query from Express</h3>
<p>Your Express routes now read from a pre-populated database with realistic data.</p>

<h2>Complete Example</h2>
<p>The seed script creates tables, fetches data from MockHero, and inserts it into SQLite. Your Express routes then serve realistic data from the database.</p>

<h2>Why MockHero vs Faker / Manual Seeds</h2>
<ul>
<li><strong>API-native</strong> &mdash; MockHero is an API seeding an API. No library installation needed.</li>
<li><strong>Database agnostic</strong> &mdash; works with SQLite, Postgres, MongoDB, or any database you use with Express.</li>
<li><strong>Team consistency</strong> &mdash; everyone seeds from the same schema, same deterministic seed.</li>
</ul>

<h2>Get Started</h2>
<p>Free tier, no credit card. <a href="https://mockhero.dev/sign-up">Sign up at mockhero.dev</a> and seed your Express API in minutes.</p>
`,
  },

  // USE CASES
  {
    slug: "generate-ecommerce-test-data",
    title: "Generate E-commerce Test Data with MockHero",
    description:
      "Create realistic e-commerce test data including products, customers, orders, and order items using the MockHero API.",
    category: "Use Case",
    date: "2026-03-22",
    author: "MockHero Team",
    content: `
<h2>The Problem</h2>
<p>E-commerce applications have some of the most complex data models in web development: customers, products, categories, orders, order items, reviews, and coupons, all tightly linked with foreign keys. Building test data for this by hand means managing six or more interconnected tables where every ID has to match.</p>
<p>Most teams give up and test with two products and one order. The result: your product listing page has never been tested with 100 items, your cart calculations have never been verified with edge-case prices, and your admin dashboard shows empty charts.</p>

<h2>The Solution: MockHero API</h2>
<p>MockHero handles the relational complexity for you. Define customers, products, and orders with <code>ref</code> fields, and get back a complete, consistent e-commerce dataset in one call. Or use the built-in <code>ecommerce</code> template for zero-config data.</p>

<h2>Quick Setup</h2>
<pre><code>curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "x-api-key: mh_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
  "template": "ecommerce",
  "scale": 3,
  "format": "json"
}'</code></pre>

<h2>Step-by-Step Guide</h2>
<h3>1. Use the ecommerce template</h3>
<p>The fastest way is MockHero's built-in template. It generates customers, products, orders, and order items with correct relationships.</p>

<h3>2. Get your MockHero API key</h3>
<p>Sign up at <a href="https://mockhero.dev/sign-up">mockhero.dev/sign-up</a>.</p>

<h3>3. Custom schema for more control</h3>
<p>Define tables for categories, products, customers, orders, and order_items with <code>ref</code> fields linking order_items to both orders and products, and orders to customers.</p>

<h3>4. Insert into your database</h3>
<p>Use any of the database-specific guides in this blog (Supabase, Prisma, Drizzle, etc.) to insert the returned JSON.</p>

<h3>5. Verify relationships</h3>
<p>Check that order items reference valid orders and products, and that orders reference valid customers.</p>

<h2>Complete Example</h2>
<p>The template approach is a one-liner. The custom schema gives you full control over field types, counts, and table structure. Both produce relationally consistent data.</p>

<h2>Why MockHero vs Faker / Manual Seeds</h2>
<ul>
<li><strong>Built-in template</strong> &mdash; one line for a complete e-commerce dataset.</li>
<li><strong>Multi-table refs</strong> &mdash; order_items correctly reference both orders and products.</li>
<li><strong>Scale parameter</strong> &mdash; multiply all counts with a single number for load testing.</li>
</ul>

<h2>Get Started</h2>
<p>Free tier, no credit card. <a href="https://mockhero.dev/sign-up">Sign up at mockhero.dev</a> and generate a complete e-commerce dataset in seconds.</p>
`,
  },
  {
    slug: "generate-crm-test-data",
    title: "Generate CRM Test Data with MockHero",
    description:
      "Create realistic CRM test data with companies, contacts, deals, and activities using the MockHero API.",
    category: "Use Case",
    date: "2026-03-22",
    author: "MockHero Team",
    content: `
<h2>The Problem</h2>
<p>CRM applications depend on rich, interconnected data: companies, contacts, deals at various pipeline stages, activities, and notes. Testing with "Acme Corp" and "John Doe" repeated 50 times makes it impossible to evaluate search, filtering, or dashboard analytics.</p>
<p>CRM data is also hierarchical. Contacts belong to companies, deals belong to contacts, and activities belong to deals. Maintaining this hierarchy with manual seeds is a constant source of bugs.</p>

<h2>The Solution: MockHero API</h2>
<p>MockHero generates realistic business data with proper relationships. Company names look real, contact names match diverse locales, and deal amounts follow realistic distributions, all linked through <code>ref</code> fields.</p>

<h2>Quick Setup</h2>
<pre><code>curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "x-api-key: mh_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
  "tables": [
    {
      "name": "companies",
      "count": 15,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "name", "type": "company_name" },
        { "name": "industry", "type": "enum", "params": { "values": ["Technology","Healthcare","Finance","Retail","Manufacturing"] } },
        { "name": "website", "type": "url" }
      ]
    },
    {
      "name": "contacts",
      "count": 40,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "company_id", "type": "ref", "params": { "ref": "companies.id" } },
        { "name": "name", "type": "full_name" },
        { "name": "email", "type": "email" },
        { "name": "title", "type": "job_title" }
      ]
    },
    {
      "name": "deals",
      "count": 25,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "contact_id", "type": "ref", "params": { "ref": "contacts.id" } },
        { "name": "title", "type": "catch_phrase" },
        { "name": "value", "type": "integer", "params": { "min": 5000, "max": 250000 } },
        { "name": "stage", "type": "enum", "params": { "values": ["lead","qualified","proposal","negotiation","closed_won","closed_lost"] } }
      ]
    }
  ],
  "format": "json"
}'</code></pre>

<h2>Step-by-Step Guide</h2>
<h3>1. Get your MockHero API key</h3>
<p>Sign up at <a href="https://mockhero.dev/sign-up">mockhero.dev/sign-up</a>.</p>

<h3>2. Design your CRM schema</h3>
<p>Use the schema above as a starting point. Add tables for activities, notes, or tasks as needed.</p>

<h3>3. Fetch the data</h3>
<p>Use the curl command above or integrate it into your seed script in any language.</p>

<h3>4. Insert into your database</h3>
<p>The JSON response includes arrays for each table. Insert companies first, then contacts, then deals.</p>

<h3>5. Verify in your CRM UI</h3>
<p>Browse the pipeline view, check that deals are linked to contacts and contacts to companies.</p>

<h2>Complete Example</h2>
<p>The schema above generates 15 companies, 40 contacts, and 25 deals with full relational integrity. Extend it with activities and notes by adding more tables with <code>ref</code> fields.</p>

<h2>Why MockHero vs Faker / Manual Seeds</h2>
<ul>
<li><strong>Hierarchical data</strong> &mdash; companies, contacts, deals linked automatically.</li>
<li><strong>Business-realistic values</strong> &mdash; company names, job titles, and deal values that look real.</li>
<li><strong>Pipeline distribution</strong> &mdash; enum fields give you deals across all stages for testing dashboards.</li>
</ul>

<h2>Get Started</h2>
<p>Free tier, no credit card. <a href="https://mockhero.dev/sign-up">Sign up at mockhero.dev</a> and build a realistic CRM dataset in minutes.</p>
`,
  },
  {
    slug: "generate-blog-test-data",
    title: "Generate Blog and CMS Test Data with MockHero",
    description:
      "Create realistic blog test data with authors, posts, categories, and comments using the MockHero API.",
    category: "Use Case",
    date: "2026-03-22",
    author: "MockHero Team",
    content: `
<h2>The Problem</h2>
<p>Building a blog or CMS requires data to test layouts, pagination, search, and category filtering. A handful of "Lorem ipsum" posts with identical authors tells you nothing about how your design handles long titles, short excerpts, or posts with dozens of comments.</p>
<p>Most blog seed scripts hardcode three posts and call it done. Then in production, the first real post with a long title breaks the card layout.</p>

<h2>The Solution: MockHero API</h2>
<p>MockHero generates realistic blog content with proper relationships between authors, posts, categories, and comments. Use the built-in <code>blog</code> template or define a custom schema for full control.</p>

<h2>Quick Setup</h2>
<pre><code>curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "x-api-key: mh_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
  "template": "blog",
  "scale": 2,
  "format": "json"
}'</code></pre>

<h2>Step-by-Step Guide</h2>
<h3>1. Use the blog template</h3>
<p>The <code>blog</code> template generates authors, categories, posts, and comments out of the box.</p>

<h3>2. Get your MockHero API key</h3>
<p>Sign up at <a href="https://mockhero.dev/sign-up">mockhero.dev/sign-up</a>.</p>

<h3>3. Custom schema for more control</h3>
<p>Define tables for authors, posts (with slug, excerpt, body, category fields), and comments linked through <code>ref</code> fields.</p>

<h3>4. Insert into your CMS database</h3>
<p>Use the returned JSON with your preferred database driver or ORM.</p>

<h3>5. Test your blog UI</h3>
<p>Browse the post listing page, open individual posts, check comments, and test category filtering with real data.</p>

<h2>Complete Example</h2>
<p>The template gives you instant data. The custom schema lets you match your exact CMS model. Both approaches produce data with valid cross-table references.</p>

<h2>Why MockHero vs Faker / Manual Seeds</h2>
<ul>
<li><strong>Blog template</strong> &mdash; one line for a complete blog dataset.</li>
<li><strong>Realistic content</strong> &mdash; titles, excerpts, and body text that actually read well.</li>
<li><strong>Comment threading</strong> &mdash; easily extend the schema to support nested comments with self-referencing <code>ref</code> fields.</li>
</ul>

<h2>Get Started</h2>
<p>Free tier, no credit card. <a href="https://mockhero.dev/sign-up">Sign up at mockhero.dev</a> and fill your blog with realistic content in seconds.</p>
`,
  },
  {
    slug: "test-data-for-ci-cd-pipelines",
    title: "Test Data for CI/CD Pipelines with MockHero",
    description:
      "Generate deterministic test data for your CI/CD pipeline using MockHero's seed parameter. Reproducible data for every build.",
    category: "Use Case",
    date: "2026-03-22",
    author: "MockHero Team",
    content: `
<h2>The Problem</h2>
<p>CI/CD pipelines need consistent test data, but most approaches fail. Shared staging databases get corrupted by parallel test runs. Fixture files go stale. Random Faker data produces flaky tests because assertions depend on values that change every run.</p>
<p>You need data that is realistic enough to test real behavior, but deterministic enough that assertions are stable across every build.</p>

<h2>The Solution: MockHero API</h2>
<p>MockHero's <code>seed</code> parameter generates identical data every time. Pass the same seed, get the same records. Your tests can assert on specific values and pass reliably in CI. Change the seed to generate a completely different dataset.</p>

<h2>Quick Setup</h2>
<pre><code>curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "x-api-key: mh_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
  "tables": [
    {
      "name": "users",
      "count": 5,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "email", "type": "email" },
        { "name": "name", "type": "full_name" }
      ]
    }
  ],
  "format": "json",
  "seed": 42
}'</code></pre>

<h2>Step-by-Step Guide</h2>
<h3>1. Choose a fixed seed</h3>
<p>Pick any integer as your seed value. The same seed always returns the same data.</p>

<h3>2. Get your MockHero API key</h3>
<p>Sign up at <a href="https://mockhero.dev/sign-up">mockhero.dev/sign-up</a>. Store the key as a CI secret.</p>

<h3>3. Create a setup script</h3>
<p>Write a <code>test/setup.mjs</code> that calls MockHero with a fixed seed and inserts the data into your test database before tests run.</p>

<h3>4. Add to your CI config</h3>
<pre><code># .github/workflows/test.yml
- name: Seed test database
  env:
    MOCKHERO_API_KEY: \${{ secrets.MOCKHERO_API_KEY }}
  run: node test/setup.mjs</code></pre>

<h3>5. Write stable assertions</h3>
<p>Since the data is deterministic, you can assert on exact values in your tests. The first user will always have the same name and email.</p>

<h2>Complete Example</h2>
<p>The setup script and CI config above form the complete workflow. Every build gets identical data, making tests reliable and debuggable.</p>

<h2>Why MockHero vs Faker / Fixtures</h2>
<ul>
<li><strong>Deterministic</strong> &mdash; same <code>seed</code> = same data, every time. No flaky tests.</li>
<li><strong>No fixture files</strong> &mdash; generate fresh data that matches your current schema automatically.</li>
<li><strong>Parallel-safe</strong> &mdash; each test run gets its own isolated dataset.</li>
</ul>

<h2>Get Started</h2>
<p>Free tier, no credit card. <a href="https://mockhero.dev/sign-up">Sign up at mockhero.dev</a> and make your CI tests deterministic today.</p>
`,
  },
  {
    slug: "deterministic-test-fixtures-with-seeds",
    title: "Deterministic Test Fixtures with MockHero Seeds",
    description:
      "Generate reproducible test fixtures using MockHero's seed parameter. Same seed, same data, every time.",
    category: "Use Case",
    date: "2026-03-23",
    author: "MockHero Team",
    content: `
<h2>The Problem</h2>
<p>Flaky tests are a plague on development teams. A common cause: test data that changes between runs. When your test asserts that the first user's email is a specific value but Faker generates a different email every time, the test passes locally and fails in CI.</p>
<p>Hardcoded fixtures solve the flakiness but create a maintenance burden. Every schema change requires updating every fixture file. For a project with 50 test files, that is hundreds of manual edits.</p>

<h2>The Solution: MockHero API</h2>
<p>MockHero's <code>seed</code> parameter produces identical output for identical input. Pass <code>"seed": 42</code> and you get the exact same names, emails, UUIDs, and relationships every time. Change the schema and the data regenerates automatically.</p>

<h2>Quick Setup</h2>
<pre><code>curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "x-api-key: mh_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
  "tables": [
    {
      "name": "products",
      "count": 3,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "name", "type": "product_name" },
        { "name": "price", "type": "decimal", "params": { "min": 10, "max": 100 } }
      ]
    }
  ],
  "format": "json",
  "seed": 12345
}'</code></pre>

<h2>Step-by-Step Guide</h2>
<h3>1. Define your test schema</h3>
<p>Create a shared schema file that all tests reference. This is the single source of truth for your test data shape.</p>

<h3>2. Get your MockHero API key</h3>
<p>Sign up at <a href="https://mockhero.dev/sign-up">mockhero.dev/sign-up</a>.</p>

<h3>3. Generate fixtures with a fixed seed</h3>
<p>Write a <code>fixtures/generate.mjs</code> script that calls MockHero with a fixed seed and writes the results to JSON files.</p>

<h3>4. Commit the fixtures</h3>
<p>Since the data is deterministic, you can commit the JSON files. Regenerate them only when your schema changes.</p>

<h3>5. Use in tests</h3>
<p>Import the fixture JSON files in your test files. Assertions are stable because the data never changes between runs.</p>

<h2>Complete Example</h2>
<p>The fixture generator and test usage form the complete pattern. Run the generator once, commit the JSON, and your tests are stable forever (until you intentionally change the schema).</p>

<h2>Why MockHero vs Faker / Manual Fixtures</h2>
<ul>
<li><strong>Reproducible</strong> &mdash; <code>seed</code> parameter guarantees byte-identical output.</li>
<li><strong>Self-updating</strong> &mdash; change the schema, re-run the generator, and fixtures match your new models.</li>
<li><strong>Realistic</strong> &mdash; test with data that looks like production, not "Test User 1".</li>
</ul>

<h2>Get Started</h2>
<p>Free tier, 1,000 rows/month. <a href="https://mockhero.dev/sign-up">Sign up at mockhero.dev</a> and end flaky tests with deterministic fixtures.</p>
`,
  },
  {
    slug: "generate-test-data-multiple-locales",
    title: "Generate Test Data in Multiple Locales with MockHero",
    description:
      "Create localized test data for international applications using MockHero's locale parameter. Names, addresses, and phone numbers in any locale.",
    category: "Use Case",
    date: "2026-03-23",
    author: "MockHero Team",
    content: `
<h2>The Problem</h2>
<p>If your application serves users internationally, you need test data that reflects that. English-only test data hides bugs: names with accents break sorting, Japanese addresses overflow address fields, and German phone numbers fail your validation regex.</p>
<p>Most Faker libraries support locales, but you have to configure each field individually. Want French names with German addresses? You are writing custom logic for every combination.</p>

<h2>The Solution: MockHero API</h2>
<p>MockHero supports a <code>locale</code> parameter that applies to all locale-sensitive field types. Generate French names, Japanese addresses, or Brazilian phone numbers with a single parameter change.</p>

<h2>Quick Setup</h2>
<pre><code>curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "x-api-key: mh_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
  "tables": [
    {
      "name": "users",
      "count": 10,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "name", "type": "full_name" },
        { "name": "email", "type": "email" },
        { "name": "phone", "type": "phone" },
        { "name": "address", "type": "street_address" },
        { "name": "city", "type": "city" }
      ]
    }
  ],
  "locale": "fr",
  "format": "json"
}'</code></pre>

<h2>Step-by-Step Guide</h2>
<h3>1. Choose your locales</h3>
<p>MockHero supports locales like <code>en</code>, <code>fr</code>, <code>de</code>, <code>ja</code>, <code>pt_BR</code>, <code>es</code>, and many more.</p>

<h3>2. Get your MockHero API key</h3>
<p>Sign up at <a href="https://mockhero.dev/sign-up">mockhero.dev/sign-up</a>.</p>

<h3>3. Generate data for multiple locales</h3>
<p>Loop through your target locales, calling MockHero's API with a different <code>locale</code> parameter each time. Combine the results into a single dataset.</p>

<h3>4. Insert into your database</h3>
<p>Combine all locale arrays into a single users table, or keep them separate for locale-specific testing.</p>

<h3>5. Test internationalization</h3>
<p>Verify that your UI handles accented characters, different address formats, varying name lengths, and locale-specific phone number patterns.</p>

<h2>Complete Example</h2>
<p>Generate users in 5 different locales with a simple loop. Extend it by adding more tables or increasing counts for comprehensive i18n testing.</p>

<h2>Why MockHero vs Faker / Manual Seeds</h2>
<ul>
<li><strong>One parameter</strong> &mdash; set <code>locale</code> once and all fields adapt automatically.</li>
<li><strong>Real locale data</strong> &mdash; names, cities, and addresses from actual locale dictionaries.</li>
<li><strong>Mix and match</strong> &mdash; generate different locales for different tables in the same request.</li>
</ul>

<h2>Get Started</h2>
<p>Free tier, no credit card. <a href="https://mockhero.dev/sign-up">Sign up at mockhero.dev</a> and test your app with truly international data.</p>
`,
  },

  // AI / AGENT TEST DATA
  {
    slug: "how-to-generate-test-data-with-ai",
    title: "AI-Powered Test Data Generation: The Complete Guide",
    description:
      "Learn how AI is transforming test data generation. Discover why combining LLMs with structured APIs like MockHero produces better, faster, and more realistic synthetic data than manual approaches.",
    category: "AI",
    date: "2026-03-26",
    author: "MockHero Team",
    content: `
<h2>The Problem</h2>
<p>Generating realistic test data has always been one of the most tedious parts of software development. You need data that looks real, follows business rules, maintains referential integrity across tables, and covers edge cases. Traditional approaches fall into two camps: writing seed scripts by hand (slow and brittle) or using libraries like Faker.js (better, but you still handle relationships yourself).</p>
<p>AI and large language models have changed expectations. Developers now expect to describe what they want in natural language and get working code back. But asking an LLM to generate test data directly has its own problems: the output is inconsistent, the data often violates constraints, and there is no reproducibility between runs.</p>

<h2>The Solution: AI + Structured API</h2>
<p>The sweet spot is combining AI intelligence with a structured, deterministic API. MockHero gives you a schema-driven API with 156+ field types and built-in relational integrity. AI agents can generate the perfect MockHero schema for your use case, then the API handles the actual data generation with guaranteed consistency.</p>
<p>This means you get the best of both worlds: the creativity and context-awareness of AI for schema design, plus the reliability and determinism of a purpose-built data generation engine.</p>

<h2>Quick Setup</h2>
<p>Ask any AI assistant to help you generate a MockHero schema, then call the API:</p>
<pre><code># AI generates this schema based on your description
curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "x-api-key: mh_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
  "tables": [
    {
      "name": "patients",
      "count": 50,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "full_name", "type": "full_name" },
        { "name": "date_of_birth", "type": "date" },
        { "name": "email", "type": "email" },
        { "name": "blood_type", "type": "enum", "params": { "values": ["A+","A-","B+","B-","O+","O-","AB+","AB-"] } }
      ]
    },
    {
      "name": "appointments",
      "count": 200,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "patient_id", "type": "ref", "params": { "ref": "patients.id" } },
        { "name": "scheduled_at", "type": "datetime" },
        { "name": "type", "type": "enum", "params": { "values": ["checkup","follow-up","emergency","consultation"] } },
        { "name": "notes", "type": "sentence" }
      ]
    }
  ],
  "format": "json"
}'</code></pre>

<h2>Step-by-Step Guide</h2>
<h3>1. Describe your data needs to an AI assistant</h3>
<p>Tell your AI coding assistant what kind of application you are building and what tables you need. For example: "I'm building a healthcare scheduling app. I need patients with demographics and appointments linked to them."</p>

<h3>2. Let the AI generate the MockHero schema</h3>
<p>The AI assistant will produce a JSON schema using MockHero's field types. Review it to make sure the tables, counts, and field types match your requirements.</p>

<h3>3. Call the MockHero API</h3>
<p>Use the generated schema in a <code>curl</code> command or integrate it into your seed script. MockHero handles relational consistency automatically through <code>ref</code> fields.</p>

<h3>4. Use the data in your application</h3>
<p>The API returns JSON (or SQL/CSV) that you can pipe directly into your database, use in your frontend during development, or feed into your test suite.</p>

<h3>5. Iterate with AI assistance</h3>
<p>Need more tables? Different distributions? Edge cases? Ask the AI to modify the schema and regenerate. The feedback loop is measured in seconds, not hours.</p>

<h2>Why MockHero vs Raw AI Data Generation</h2>
<ul>
<li><strong>Deterministic output</strong> &mdash; pass a <code>seed</code> parameter and get identical data every run, unlike raw LLM output which varies each time.</li>
<li><strong>Referential integrity</strong> &mdash; <code>ref</code> fields guarantee valid foreign keys across all tables automatically.</li>
<li><strong>Scale</strong> &mdash; generate thousands of rows instantly. LLMs struggle with more than a few dozen records and often hallucinate duplicates.</li>
<li><strong>Cost</strong> &mdash; a single API call replaces thousands of LLM tokens. MockHero's free tier gives you 1,000 rows per month.</li>
</ul>

<h2>Get Started</h2>
<p>Combine the power of AI with the reliability of MockHero. <a href="https://mockhero.dev/sign-up">Sign up free</a> and start generating production-quality test data in seconds. No credit card required.</p>
`,
  },
  {
    slug: "mcp-server-test-data-for-ai-agents",
    title: "Using MCP Server to Generate Test Data in AI Coding Agents",
    description:
      "Learn how MockHero's MCP (Model Context Protocol) server lets AI coding agents like Cursor, Claude Code, and Windsurf generate realistic test data directly from your IDE.",
    category: "AI",
    date: "2026-03-26",
    author: "MockHero Team",
    content: `
<h2>The Problem</h2>
<p>AI coding agents are getting smarter, but they still struggle with test data. When you ask an agent to scaffold a project or write tests, it typically hardcodes a handful of records with names like "John Doe" and emails like "test@test.com". The data is unrealistic, there are no relationships between tables, and the same five records get copy-pasted everywhere.</p>
<p>Even when agents try to use Faker.js, they have to generate the code, install dependencies, run it, and parse the output. It is a multi-step process that breaks the flow of AI-assisted development.</p>

<h2>The Solution: MockHero MCP Server</h2>
<p>The Model Context Protocol (MCP) is an open standard that lets AI agents call external tools directly. MockHero provides an MCP server that any compatible agent can use to generate realistic, relational test data without leaving the IDE. The agent describes the schema, MockHero returns the data, and the agent inserts it into your code or database.</p>
<p>No npm installs. No seed scripts. The agent handles everything through a single tool call.</p>

<h2>Quick Setup</h2>
<p>Add MockHero's MCP server to your agent's configuration:</p>
<pre><code>{
  "mcpServers": {
    "mockhero": {
      "command": "npx",
      "args": ["-y", "@mockhero/mcp-server"],
      "env": {
        "MOCKHERO_API_KEY": "mh_your_api_key"
      }
    }
  }
}</code></pre>

<p>Once configured, your AI agent can call MockHero directly. For example, tell the agent:</p>
<pre><code>"Generate 20 users and 50 orders with realistic data for my e-commerce project"</code></pre>
<p>The agent translates this into a MockHero API call behind the scenes and gives you production-quality data instantly.</p>

<h2>Step-by-Step Guide</h2>
<h3>1. Install the MCP server</h3>
<p>The MockHero MCP server runs via <code>npx</code>, so there is nothing to install globally. Just add the configuration block above to your AI agent's MCP settings file.</p>

<h3>2. Get your API key</h3>
<p>Sign up at <a href="https://mockhero.dev/sign-up">mockhero.dev/sign-up</a> and copy your API key from the dashboard.</p>

<h3>3. Configure your agent</h3>
<p>Each agent stores MCP configuration differently. For Cursor, add it to <code>.cursor/mcp.json</code>. For Claude Code, add it to <code>.claude/mcp.json</code>. For Windsurf, add it to your MCP settings. The server configuration is identical across all agents.</p>

<h3>4. Ask the agent to generate data</h3>
<p>Use natural language. The agent will automatically use the MockHero MCP tool when it recognizes a test data request. Examples:</p>
<ul>
<li>"Seed my database with 100 users and their related posts"</li>
<li>"Generate test data for my healthcare scheduling app"</li>
<li>"Create realistic e-commerce data with products, customers, and orders"</li>
</ul>

<h3>5. Use the generated data</h3>
<p>The agent will insert the data directly into your seed files, test fixtures, or database migration scripts. No manual copy-pasting required.</p>

<h2>Why MockHero MCP vs Manual Data Generation</h2>
<ul>
<li><strong>Zero friction</strong> &mdash; the agent generates data in-context, without leaving your IDE or switching tools.</li>
<li><strong>Schema-aware</strong> &mdash; 156+ field types mean the agent can request exactly the right data shape for your use case.</li>
<li><strong>Relational integrity</strong> &mdash; foreign keys just work. No manual ID wiring needed.</li>
<li><strong>Agent-native</strong> &mdash; MCP is the standard protocol for tool use in AI agents. MockHero speaks it natively.</li>
</ul>

<h2>Get Started</h2>
<p>Add MockHero's MCP server to your AI coding agent in under a minute. <a href="https://mockhero.dev/sign-up">Sign up free</a> and give your agent the power to generate realistic test data on demand.</p>
`,
  },
  {
    slug: "cursor-ide-test-data-with-mockhero",
    title: "Generate Test Data in Cursor IDE with MockHero MCP",
    description:
      "Set up MockHero's MCP server in Cursor IDE to generate realistic test data directly from your AI-powered editor. Step-by-step configuration guide included.",
    category: "AI",
    date: "2026-03-26",
    author: "MockHero Team",
    content: `
<h2>The Problem</h2>
<p>Cursor IDE has become the go-to editor for AI-assisted development. Its built-in agent can write code, refactor files, and debug issues. But when it comes to test data, Cursor's agent falls back on hardcoded values or basic Faker snippets. You end up with <code>{ name: "Test User", email: "test@example.com" }</code> scattered across your project.</p>
<p>What you really need is realistic, relational data that matches your actual schema. But generating that data usually means leaving Cursor, setting up a separate seed script, and running it manually. That context switch kills the flow that makes Cursor productive in the first place.</p>

<h2>The Solution: MockHero MCP in Cursor</h2>
<p>Cursor supports the Model Context Protocol (MCP), which lets the agent call external tools directly. By adding MockHero as an MCP server, you give Cursor's agent the ability to generate realistic test data without leaving your editor. Just describe what you need in natural language, and the agent handles the rest.</p>

<h2>Quick Setup</h2>
<p>Create or edit <code>.cursor/mcp.json</code> in your project root:</p>
<pre><code>{
  "mcpServers": {
    "mockhero": {
      "command": "npx",
      "args": ["-y", "@mockhero/mcp-server"],
      "env": {
        "MOCKHERO_API_KEY": "mh_your_api_key"
      }
    }
  }
}</code></pre>
<p>Restart Cursor, and the MockHero tool will appear in the agent's available tools list.</p>

<h2>Step-by-Step Guide</h2>
<h3>1. Get your MockHero API key</h3>
<p>Sign up at <a href="https://mockhero.dev/sign-up">mockhero.dev/sign-up</a> and copy your API key from the dashboard.</p>

<h3>2. Create the MCP configuration</h3>
<p>In your project root, create a <code>.cursor</code> directory if it does not exist, then add <code>mcp.json</code> with the configuration shown above. Replace <code>mh_your_api_key</code> with your actual key.</p>

<h3>3. Restart Cursor</h3>
<p>Cursor reads MCP configuration on startup. After saving the file, restart the editor to pick up the new server.</p>

<h3>4. Ask the agent to generate data</h3>
<p>Open the Cursor agent panel and type a request like:</p>
<pre><code>"Generate a seed script for my Prisma database with 30 users,
100 posts, and 200 comments. Use realistic data."</code></pre>
<p>The agent will use MockHero's MCP tool to generate the data and write the seed script directly into your project.</p>

<h3>5. Run the seed script</h3>
<p>The agent can also run the script for you, or you can execute it from the terminal:</p>
<pre><code>npx tsx prisma/seed.ts</code></pre>

<h2>Why MockHero MCP in Cursor vs Alternatives</h2>
<ul>
<li><strong>In-editor experience</strong> &mdash; no context switching. Data generation happens inside your normal Cursor workflow.</li>
<li><strong>Natural language</strong> &mdash; describe your schema in plain English. The agent maps it to MockHero's 156+ field types.</li>
<li><strong>Relational data</strong> &mdash; the agent automatically sets up <code>ref</code> fields so foreign keys are valid across all tables.</li>
<li><strong>Deterministic</strong> &mdash; pass a <code>seed</code> value for reproducible data in CI/CD pipelines.</li>
</ul>

<h2>Get Started</h2>
<p>Add MockHero to Cursor in under a minute. <a href="https://mockhero.dev/sign-up">Sign up free</a>, drop in the MCP config, and let your AI agent handle test data generation.</p>
`,
  },
  {
    slug: "claude-code-test-data-generation",
    title: "Test Data Generation with Claude Code and MockHero",
    description:
      "Configure MockHero's MCP server in Claude Code to generate realistic, relational test data from your terminal. Complete setup walkthrough with examples.",
    category: "AI",
    date: "2026-03-26",
    author: "MockHero Team",
    content: `
<h2>The Problem</h2>
<p>Claude Code is a powerful terminal-based AI agent that can navigate codebases, edit files, and run commands. But when it needs to generate test data, it typically writes inline JSON or uses Faker.js snippets. The results are functional but shallow: a handful of flat records with no relationships and generic-looking values.</p>
<p>For any real project, you need hundreds or thousands of records across multiple tables with valid foreign keys. Asking Claude Code to generate all that data inline leads to bloated responses, token waste, and inconsistent results between sessions.</p>

<h2>The Solution: MockHero MCP in Claude Code</h2>
<p>Claude Code supports MCP servers as external tools. By registering MockHero's MCP server, Claude Code can generate arbitrarily large datasets with relational integrity in a single tool call. You describe what you need, and Claude Code calls MockHero, gets the data, and writes it wherever you need it.</p>

<h2>Quick Setup</h2>
<p>Add MockHero to your Claude Code MCP configuration. Create or edit <code>.claude/mcp.json</code> in your project root:</p>
<pre><code>{
  "mcpServers": {
    "mockhero": {
      "command": "npx",
      "args": ["-y", "@mockhero/mcp-server"],
      "env": {
        "MOCKHERO_API_KEY": "mh_your_api_key"
      }
    }
  }
}</code></pre>
<p>Next time you start a Claude Code session in that project, it will automatically load the MockHero tool.</p>

<h2>Step-by-Step Guide</h2>
<h3>1. Get your MockHero API key</h3>
<p>Sign up at <a href="https://mockhero.dev/sign-up">mockhero.dev/sign-up</a> and copy your API key.</p>

<h3>2. Add the MCP configuration</h3>
<p>Place <code>.claude/mcp.json</code> in your project root with the configuration above. You can also add it to <code>~/.claude/mcp.json</code> for global access across all projects.</p>

<h3>3. Start a Claude Code session</h3>
<p>Run <code>claude</code> in your project directory. Claude Code will detect the MCP server and load it automatically.</p>

<h3>4. Request test data</h3>
<p>Ask Claude Code to generate data naturally:</p>
<pre><code>"Create a seed script for my Next.js app with Drizzle ORM. I need
50 organizations, 200 users belonging to those orgs, and 500 tasks
assigned to users. Make the data realistic."</code></pre>
<p>Claude Code will call MockHero's MCP server, receive the generated data, and write a complete seed script for your project.</p>

<h3>5. Run and verify</h3>
<p>Claude Code can run the seed script directly in the terminal. Verify the data in your database to confirm foreign keys are correct and the data looks realistic.</p>

<h2>Why MockHero MCP in Claude Code vs Inline Generation</h2>
<ul>
<li><strong>Token-efficient</strong> &mdash; instead of generating data inline (burning thousands of tokens), Claude Code makes a single MCP call.</li>
<li><strong>Scalable</strong> &mdash; generate 10 rows or 10,000 rows with the same call. Inline generation tops out at a few dozen.</li>
<li><strong>Consistent</strong> &mdash; MockHero returns the same structure every time. No hallucinated field names or broken relationships.</li>
<li><strong>Terminal-native</strong> &mdash; works seamlessly in Claude Code's terminal workflow. No browser or GUI needed.</li>
</ul>

<h2>Get Started</h2>
<p>Give Claude Code the superpower of realistic test data. <a href="https://mockhero.dev/sign-up">Sign up free at mockhero.dev</a>, add the MCP config, and start generating production-quality data from your terminal.</p>
`,
  },
  {
    slug: "windsurf-test-data-with-mcp",
    title: "Generate Test Data in Windsurf with MockHero MCP",
    description:
      "Set up MockHero's MCP server in Windsurf IDE for seamless test data generation. Let Windsurf's Cascade agent create realistic, relational data while you code.",
    category: "AI",
    date: "2026-03-26",
    author: "MockHero Team",
    content: `
<h2>The Problem</h2>
<p>Windsurf's Cascade agent excels at understanding your entire codebase and making multi-file edits. But when it generates test data, the results are often shallow. You get a few hardcoded records that are enough to make the code compile but not enough to test real-world scenarios like pagination, search filtering, or edge cases in business logic.</p>
<p>Building a proper seed script manually defeats the purpose of using an AI-powered editor. You want the agent to handle the boring parts, including generating realistic data that actually exercises your application.</p>

<h2>The Solution: MockHero MCP in Windsurf</h2>
<p>Windsurf supports MCP tool servers, allowing Cascade to call external services. By adding MockHero as an MCP server, Cascade can generate realistic, relationally-consistent test data directly within your workflow. Describe your data needs in the chat, and Cascade does the rest.</p>

<h2>Quick Setup</h2>
<p>Add MockHero to your Windsurf MCP configuration:</p>
<pre><code>{
  "mcpServers": {
    "mockhero": {
      "command": "npx",
      "args": ["-y", "@mockhero/mcp-server"],
      "env": {
        "MOCKHERO_API_KEY": "mh_your_api_key"
      }
    }
  }
}</code></pre>
<p>Save the configuration and restart Windsurf. Cascade will detect the MockHero tool automatically.</p>

<h2>Step-by-Step Guide</h2>
<h3>1. Get your MockHero API key</h3>
<p>Sign up at <a href="https://mockhero.dev/sign-up">mockhero.dev/sign-up</a> and copy your API key from the dashboard.</p>

<h3>2. Configure MCP in Windsurf</h3>
<p>Open Windsurf's MCP settings and add the MockHero server configuration shown above. The server runs via <code>npx</code> so there are no global installations needed.</p>

<h3>3. Restart and verify</h3>
<p>Restart Windsurf and open the Cascade panel. You should see MockHero listed as an available tool. If it does not appear, check that your API key is set correctly.</p>

<h3>4. Ask Cascade to generate data</h3>
<p>Use natural language in the Cascade chat:</p>
<pre><code>"I need a seed script for my SaaS app. Generate 10 organizations,
50 users across those orgs, and 200 projects with realistic names
and descriptions. Use my Supabase database."</code></pre>
<p>Cascade will call MockHero, receive the data, and write a seed script tailored to your project's database setup.</p>

<h3>5. Execute and test</h3>
<p>Cascade can run the seed script from Windsurf's terminal. Open your database GUI to verify the data and its relationships.</p>

<h2>Why MockHero MCP in Windsurf vs Alternatives</h2>
<ul>
<li><strong>Cascade-native</strong> &mdash; works within Windsurf's agentic workflow. No context switching to external tools.</li>
<li><strong>Codebase-aware</strong> &mdash; Cascade understands your schema files and can generate MockHero requests that match your actual tables.</li>
<li><strong>Production-realistic</strong> &mdash; 156+ field types produce data that looks like a real production database, not placeholder text.</li>
<li><strong>Multi-table</strong> &mdash; generate complex schemas with multiple related tables in a single request.</li>
</ul>

<h2>Get Started</h2>
<p>Give Windsurf's Cascade the ability to generate real test data. <a href="https://mockhero.dev/sign-up">Sign up free at mockhero.dev</a>, add the MCP config, and let your AI agent handle test data while you focus on building features.</p>
`,
  },

  // DATABASE SEEDING (continued)
  {
    slug: "how-to-seed-turso-with-test-data",
    title: "How to Seed Turso (LibSQL) with Realistic Test Data",
    description:
      "Populate your Turso embedded replicas with realistic relational test data using the MockHero API. Full Node.js seed script with the @libsql/client driver.",
    category: "Database",
    date: "2026-03-26",
    author: "MockHero Team",
    content: `
<h2>The Problem</h2>
<p>Turso brings SQLite to the edge with embedded replicas and global distribution. But edge databases start empty, and seeding them with realistic data is not straightforward. You cannot just dump a SQL file into a Turso database like you would with local SQLite. The LibSQL client requires programmatic inserts, and you need data that respects your schema's foreign keys and constraints.</p>
<p>Faker.js can produce random values, but you are still responsible for generating parent records first, collecting their IDs, and wiring child records manually. For an edge-first database like Turso, you want seeding to be fast and reproducible across replicas.</p>

<h2>The Solution: MockHero API</h2>
<p>MockHero generates relationally-consistent test data in a single API call. Define your tables with <code>ref</code> fields for foreign keys, and get back JSON you can insert directly using the LibSQL client. No ORM required, no manual ID management.</p>

<h2>Quick Setup</h2>
<pre><code>curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "x-api-key: mh_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
  "tables": [
    {
      "name": "authors",
      "count": 10,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "name", "type": "full_name" },
        { "name": "bio", "type": "sentence" },
        { "name": "email", "type": "email" }
      ]
    },
    {
      "name": "articles",
      "count": 40,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "author_id", "type": "ref", "params": { "ref": "authors.id" } },
        { "name": "title", "type": "sentence" },
        { "name": "body", "type": "paragraphs" },
        { "name": "published_at", "type": "datetime" }
      ]
    }
  ],
  "format": "json"
}'</code></pre>

<h2>Step-by-Step Guide</h2>
<h3>1. Install dependencies</h3>
<pre><code>npm install @libsql/client</code></pre>

<h3>2. Get your MockHero API key</h3>
<p>Sign up at <a href="https://mockhero.dev/sign-up">mockhero.dev/sign-up</a> and copy your API key.</p>

<h3>3. Write the seed script</h3>
<p>Create <code>seed.mjs</code>:</p>
<pre><code>import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const res = await fetch("https://api.mockhero.dev/api/v1/generate", {
  method: "POST",
  headers: {
    "x-api-key": process.env.MOCKHERO_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    tables: [
      {
        name: "authors",
        count: 10,
        fields: [
          { name: "id", type: "uuid" },
          { name: "name", type: "full_name" },
          { name: "bio", type: "sentence" },
          { name: "email", type: "email" },
        ],
      },
      {
        name: "articles",
        count: 40,
        fields: [
          { name: "id", type: "uuid" },
          { name: "author_id", type: "ref", params: { ref: "authors.id" } },
          { name: "title", type: "sentence" },
          { name: "body", type: "paragraphs" },
          { name: "published_at", type: "datetime" },
        ],
      },
    ],
    format: "json",
  }),
});

const { data } = await res.json();

for (const a of data.authors) {
  await db.execute({
    sql: "INSERT INTO authors (id, name, bio, email) VALUES (?, ?, ?, ?)",
    args: [a.id, a.name, a.bio, a.email],
  });
}

for (const art of data.articles) {
  await db.execute({
    sql: "INSERT INTO articles (id, author_id, title, body, published_at) VALUES (?, ?, ?, ?, ?)",
    args: [art.id, art.author_id, art.title, art.body, art.published_at],
  });
}

console.log("Seeded", data.authors.length, "authors and", data.articles.length, "articles");</code></pre>

<h3>4. Run the script</h3>
<pre><code>node seed.mjs</code></pre>

<h3>5. Verify in the Turso CLI</h3>
<p>Use <code>turso db shell your-db-name</code> and run <code>SELECT * FROM articles LIMIT 5;</code> to confirm the data is in place with valid foreign keys.</p>

<h2>Why MockHero vs Faker / Manual Seeds</h2>
<ul>
<li><strong>Edge-friendly</strong> &mdash; generate data once, seed all replicas. The JSON response works with any LibSQL client.</li>
<li><strong>Relational integrity</strong> &mdash; every <code>author_id</code> in articles references a real author record.</li>
<li><strong>SQLite-native types</strong> &mdash; MockHero's output maps cleanly to SQLite column types.</li>
</ul>

<h2>Get Started</h2>
<p>Seed your Turso database with realistic data in minutes. <a href="https://mockhero.dev/sign-up">Sign up free at mockhero.dev</a> and get 1,000 rows per month, no credit card required.</p>
`,
  },
  {
    slug: "how-to-seed-planetscale-with-test-data",
    title: "How to Seed PlanetScale with Realistic Test Data",
    description:
      "Learn how to populate your PlanetScale MySQL database with realistic relational test data using the MockHero API. Includes a complete seed script with the PlanetScale serverless driver.",
    category: "Database",
    date: "2026-03-26",
    author: "MockHero Team",
    content: `
<h2>The Problem</h2>
<p>PlanetScale provides serverless MySQL with branching and non-blocking schema changes. But its branching model means you regularly create new database branches that start empty or with only schema, no data. Development branches need realistic data to test queries, UI components, and business logic. Manually writing INSERT statements for every branch is a waste of engineering time.</p>
<p>Making things harder, PlanetScale's foreign key constraints work differently from traditional MySQL. You cannot use standard foreign key references, so your seed data needs to maintain referential integrity at the application level. Libraries like Faker.js generate random values but leave the relationship problem entirely to you.</p>

<h2>The Solution: MockHero API</h2>
<p>MockHero generates relationally-consistent data where <code>ref</code> fields guarantee that child records always reference valid parent IDs. The output works perfectly with PlanetScale's application-level referential integrity model. Request JSON and insert with the serverless driver, or request SQL and pipe it through the MySQL CLI.</p>

<h2>Quick Setup</h2>
<pre><code>curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "x-api-key: mh_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
  "tables": [
    {
      "name": "teams",
      "count": 5,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "name", "type": "company_name" },
        { "name": "plan", "type": "enum", "params": { "values": ["free","pro","enterprise"] } },
        { "name": "created_at", "type": "datetime" }
      ]
    },
    {
      "name": "members",
      "count": 25,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "team_id", "type": "ref", "params": { "ref": "teams.id" } },
        { "name": "full_name", "type": "full_name" },
        { "name": "email", "type": "email" },
        { "name": "role", "type": "enum", "params": { "values": ["owner","admin","member","viewer"] } }
      ]
    }
  ],
  "format": "json"
}'</code></pre>

<h2>Step-by-Step Guide</h2>
<h3>1. Install dependencies</h3>
<pre><code>npm install @planetscale/database</code></pre>

<h3>2. Get your MockHero API key</h3>
<p>Sign up at <a href="https://mockhero.dev/sign-up">mockhero.dev/sign-up</a> and grab your key from the dashboard.</p>

<h3>3. Write the seed script</h3>
<p>Create <code>seed.mjs</code>:</p>
<pre><code>import { connect } from "@planetscale/database";

const conn = connect({
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
});

const res = await fetch("https://api.mockhero.dev/api/v1/generate", {
  method: "POST",
  headers: {
    "x-api-key": process.env.MOCKHERO_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    tables: [
      {
        name: "teams",
        count: 5,
        fields: [
          { name: "id", type: "uuid" },
          { name: "name", type: "company_name" },
          { name: "plan", type: "enum", params: { values: ["free","pro","enterprise"] } },
          { name: "created_at", type: "datetime" },
        ],
      },
      {
        name: "members",
        count: 25,
        fields: [
          { name: "id", type: "uuid" },
          { name: "team_id", type: "ref", params: { ref: "teams.id" } },
          { name: "full_name", type: "full_name" },
          { name: "email", type: "email" },
          { name: "role", type: "enum", params: { values: ["owner","admin","member","viewer"] } },
        ],
      },
    ],
    format: "json",
  }),
});

const { data } = await res.json();

for (const t of data.teams) {
  await conn.execute(
    "INSERT INTO teams (id, name, plan, created_at) VALUES (?, ?, ?, ?)",
    [t.id, t.name, t.plan, t.created_at]
  );
}

for (const m of data.members) {
  await conn.execute(
    "INSERT INTO members (id, team_id, full_name, email, role) VALUES (?, ?, ?, ?, ?)",
    [m.id, m.team_id, m.full_name, m.email, m.role]
  );
}

console.log("Seeded", data.teams.length, "teams and", data.members.length, "members");</code></pre>

<h3>4. Run the script</h3>
<pre><code>node seed.mjs</code></pre>

<h3>5. Verify in the PlanetScale console</h3>
<p>Open the Console tab in your PlanetScale dashboard and run <code>SELECT m.full_name, t.name FROM members m JOIN teams t ON m.team_id = t.id LIMIT 10;</code> to verify relationships.</p>

<h2>Why MockHero vs Faker / Manual Seeds</h2>
<ul>
<li><strong>Branch-ready</strong> &mdash; run the same seed script against any PlanetScale branch for instant realistic data.</li>
<li><strong>Application-level FK integrity</strong> &mdash; MockHero's <code>ref</code> fields handle relationships at the data level, matching PlanetScale's model.</li>
<li><strong>MySQL-compatible output</strong> &mdash; request <code>format: "sql"</code> to get MySQL-flavored INSERT statements directly.</li>
</ul>

<h2>Get Started</h2>
<p>Seed every PlanetScale branch with production-realistic data. <a href="https://mockhero.dev/sign-up">Sign up free at mockhero.dev</a> and get 1,000 rows per month.</p>
`,
  },
  {
    slug: "how-to-seed-sqlite-with-test-data",
    title: "How to Seed SQLite with Realistic Test Data",
    description:
      "Populate your SQLite database with realistic test data using the MockHero API. Works with better-sqlite3, sql.js, and the sqlite3 driver. Full seed script included.",
    category: "Database",
    date: "2026-03-26",
    author: "MockHero Team",
    content: `
<h2>The Problem</h2>
<p>SQLite is everywhere: local development databases, mobile apps, embedded systems, Electron apps, and edge runtimes. But seeding a SQLite database with realistic data often gets skipped because it feels like overkill for a "simple" database. Developers end up inserting three rows of garbage data and testing against that, missing bugs that only surface with real-world volumes and variety.</p>
<p>The irony is that SQLite is often the database closest to your users (it literally runs on their devices), yet it gets the least realistic test data. Faker libraries can generate values, but you still need to handle table creation, insertion order, and foreign key enforcement with <code>PRAGMA foreign_keys = ON</code>.</p>

<h2>The Solution: MockHero API</h2>
<p>MockHero generates realistic, relationally-consistent data and returns it as JSON or raw SQL. For SQLite, you can either insert records programmatically with a driver like <code>better-sqlite3</code>, or request SQL output and pipe it directly into the SQLite CLI. Foreign keys are always valid because MockHero resolves <code>ref</code> fields server-side.</p>

<h2>Quick Setup</h2>
<pre><code>curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "x-api-key: mh_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
  "tables": [
    {
      "name": "categories",
      "count": 8,
      "fields": [
        { "name": "id", "type": "integer_id" },
        { "name": "name", "type": "enum", "params": { "values": ["Electronics","Clothing","Books","Home","Sports","Food","Toys","Health"] } },
        { "name": "slug", "type": "slug" }
      ]
    },
    {
      "name": "products",
      "count": 50,
      "fields": [
        { "name": "id", "type": "integer_id" },
        { "name": "category_id", "type": "ref", "params": { "ref": "categories.id" } },
        { "name": "name", "type": "product_name" },
        { "name": "price_cents", "type": "integer", "params": { "min": 99, "max": 99999 } },
        { "name": "in_stock", "type": "boolean" }
      ]
    }
  ],
  "format": "json"
}'</code></pre>

<h2>Step-by-Step Guide</h2>
<h3>1. Install dependencies</h3>
<pre><code>npm install better-sqlite3</code></pre>

<h3>2. Get your MockHero API key</h3>
<p>Sign up at <a href="https://mockhero.dev/sign-up">mockhero.dev/sign-up</a> and copy your API key.</p>

<h3>3. Write the seed script</h3>
<p>Create <code>seed.mjs</code>:</p>
<pre><code>import Database from "better-sqlite3";

const db = new Database("./dev.db");
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Create tables
db.exec(\`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    name TEXT NOT NULL,
    price_cents INTEGER NOT NULL,
    in_stock INTEGER NOT NULL DEFAULT 1
  );
\`);

const res = await fetch("https://api.mockhero.dev/api/v1/generate", {
  method: "POST",
  headers: {
    "x-api-key": process.env.MOCKHERO_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    tables: [
      {
        name: "categories",
        count: 8,
        fields: [
          { name: "id", type: "integer_id" },
          { name: "name", type: "enum", params: { values: ["Electronics","Clothing","Books","Home","Sports","Food","Toys","Health"] } },
          { name: "slug", type: "slug" },
        ],
      },
      {
        name: "products",
        count: 50,
        fields: [
          { name: "id", type: "integer_id" },
          { name: "category_id", type: "ref", params: { ref: "categories.id" } },
          { name: "name", type: "product_name" },
          { name: "price_cents", type: "integer", params: { min: 99, max: 99999 } },
          { name: "in_stock", type: "boolean" },
        ],
      },
    ],
    format: "json",
  }),
});

const { data } = await res.json();

const insertCategory = db.prepare(
  "INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)"
);
const insertProduct = db.prepare(
  "INSERT INTO products (id, category_id, name, price_cents, in_stock) VALUES (?, ?, ?, ?, ?)"
);

const seedAll = db.transaction(() => {
  for (const c of data.categories) {
    insertCategory.run(c.id, c.name, c.slug);
  }
  for (const p of data.products) {
    insertProduct.run(p.id, p.category_id, p.name, p.price_cents, p.in_stock ? 1 : 0);
  }
});

seedAll();
console.log("Seeded", data.categories.length, "categories and", data.products.length, "products");</code></pre>

<h3>4. Run the script</h3>
<pre><code>node seed.mjs</code></pre>

<h3>5. Verify with the SQLite CLI</h3>
<pre><code>sqlite3 dev.db "SELECT p.name, c.name FROM products p JOIN categories c ON p.category_id = c.id LIMIT 10;"</code></pre>

<h2>Why MockHero vs Faker / Manual Seeds</h2>
<ul>
<li><strong>Transaction-friendly</strong> &mdash; insert all MockHero data in a single SQLite transaction for maximum speed.</li>
<li><strong>Foreign key safe</strong> &mdash; <code>ref</code> fields ensure every child record references a valid parent, so <code>PRAGMA foreign_keys</code> never complains.</li>
<li><strong>Works everywhere</strong> &mdash; the JSON output is driver-agnostic. Use <code>better-sqlite3</code>, <code>sql.js</code>, or <code>@libsql/client</code>.</li>
</ul>

<h2>Get Started</h2>
<p>Seed your SQLite database in seconds. <a href="https://mockhero.dev/sign-up">Sign up free at mockhero.dev</a> and get 1,000 rows per month, no credit card required.</p>
`,
  },
  {
    slug: "how-to-seed-redis-with-test-data",
    title: "How to Seed Redis with Realistic Mock Data",
    description:
      "Populate your Redis instance with realistic test data using the MockHero API. Covers hashes, sorted sets, and JSON structures with a complete Node.js script.",
    category: "Database",
    date: "2026-03-26",
    author: "MockHero Team",
    content: `
<h2>The Problem</h2>
<p>Redis is a key-value store, not a relational database, so seeding it feels fundamentally different. There are no tables to INSERT into, no SQL files to import. Instead, you have to decide on key naming conventions, choose the right data structures (hashes, sorted sets, JSON), and write custom scripts to populate them. Most developers skip this step entirely and test against an empty Redis, missing caching bugs, leaderboard edge cases, and session handling issues.</p>
<p>When you do try to seed Redis, you end up writing dozens of <code>HSET</code> and <code>ZADD</code> commands with fake data that does not reflect your actual application's patterns.</p>

<h2>The Solution: MockHero API + Redis Pipeline</h2>
<p>Use MockHero to generate realistic structured data, then map it to your Redis data structures. MockHero does not know about Redis, but it does not need to: it generates the data, you decide how to store it. The combination of MockHero's realistic data with Redis pipelines gives you a fast, repeatable seeding process.</p>

<h2>Quick Setup</h2>
<pre><code>curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "x-api-key: mh_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
  "tables": [
    {
      "name": "users",
      "count": 100,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "username", "type": "username" },
        { "name": "email", "type": "email" },
        { "name": "score", "type": "integer", "params": { "min": 0, "max": 10000 } },
        { "name": "last_active", "type": "datetime" }
      ]
    },
    {
      "name": "sessions",
      "count": 100,
      "fields": [
        { "name": "session_id", "type": "uuid" },
        { "name": "user_id", "type": "ref", "params": { "ref": "users.id" } },
        { "name": "ip_address", "type": "ipv4" },
        { "name": "user_agent", "type": "user_agent" },
        { "name": "created_at", "type": "datetime" }
      ]
    }
  ],
  "format": "json"
}'</code></pre>

<h2>Step-by-Step Guide</h2>
<h3>1. Install dependencies</h3>
<pre><code>npm install redis</code></pre>

<h3>2. Get your MockHero API key</h3>
<p>Sign up at <a href="https://mockhero.dev/sign-up">mockhero.dev/sign-up</a> and copy your API key.</p>

<h3>3. Write the seed script</h3>
<p>Create <code>seed-redis.mjs</code>:</p>
<pre><code>import { createClient } from "redis";

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

const res = await fetch("https://api.mockhero.dev/api/v1/generate", {
  method: "POST",
  headers: {
    "x-api-key": process.env.MOCKHERO_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    tables: [
      {
        name: "users",
        count: 100,
        fields: [
          { name: "id", type: "uuid" },
          { name: "username", type: "username" },
          { name: "email", type: "email" },
          { name: "score", type: "integer", params: { min: 0, max: 10000 } },
          { name: "last_active", type: "datetime" },
        ],
      },
      {
        name: "sessions",
        count: 100,
        fields: [
          { name: "session_id", type: "uuid" },
          { name: "user_id", type: "ref", params: { ref: "users.id" } },
          { name: "ip_address", type: "ipv4" },
          { name: "user_agent", type: "user_agent" },
          { name: "created_at", type: "datetime" },
        ],
      },
    ],
    format: "json",
  }),
});

const { data } = await res.json();

// Store users as hashes and build a leaderboard sorted set
const pipeline = redis.multi();
for (const u of data.users) {
  pipeline.hSet(\`user:\${u.id}\`, {
    username: u.username,
    email: u.email,
    score: String(u.score),
    last_active: u.last_active,
  });
  pipeline.zAdd("leaderboard", { score: u.score, value: u.id });
}

// Store sessions as hashes with TTL
for (const s of data.sessions) {
  pipeline.hSet(\`session:\${s.session_id}\`, {
    user_id: s.user_id,
    ip_address: s.ip_address,
    user_agent: s.user_agent,
    created_at: s.created_at,
  });
  pipeline.expire(\`session:\${s.session_id}\`, 86400);
}

await pipeline.exec();
console.log("Seeded", data.users.length, "users and", data.sessions.length, "sessions into Redis");
await redis.quit();</code></pre>

<h3>4. Run the script</h3>
<pre><code>node seed-redis.mjs</code></pre>

<h3>5. Verify with the Redis CLI</h3>
<pre><code>redis-cli ZREVRANGE leaderboard 0 9 WITHSCORES
redis-cli HGETALL user:&lt;some-uuid&gt;</code></pre>

<h2>Why MockHero vs Manual Redis Seeding</h2>
<ul>
<li><strong>Structured generation, flexible storage</strong> &mdash; MockHero generates the data shape you need; you decide the Redis data structures.</li>
<li><strong>Pipeline-friendly</strong> &mdash; batch all inserts into a single Redis pipeline for near-instant seeding.</li>
<li><strong>Realistic variety</strong> &mdash; 100 unique usernames, emails, and scores instead of <code>user1</code>, <code>user2</code>, <code>user3</code>.</li>
</ul>

<h2>Get Started</h2>
<p>Seed your Redis instance with production-realistic data. <a href="https://mockhero.dev/sign-up">Sign up free at mockhero.dev</a> and get 1,000 rows per month.</p>
`,
  },
  {
    slug: "how-to-seed-cockroachdb-with-test-data",
    title: "How to Seed CockroachDB with Realistic Test Data",
    description:
      "Populate your CockroachDB cluster with realistic relational test data using the MockHero API. Includes a complete seed script using the pg driver.",
    category: "Database",
    date: "2026-03-26",
    author: "MockHero Team",
    content: `
<h2>The Problem</h2>
<p>CockroachDB gives you distributed SQL with horizontal scalability and strong consistency. But testing distributed behavior requires realistic data volumes. Three rows in your users table will not reveal issues with range splits, query distribution, or multi-region latency. You need hundreds or thousands of records with realistic distributions across your schema.</p>
<p>CockroachDB is wire-compatible with PostgreSQL, so most Postgres tools work. But building seed scripts that generate enough realistic data with proper foreign key relationships is still a manual chore. Faker.js helps with field values, but you handle the relational wiring yourself.</p>

<h2>The Solution: MockHero API</h2>
<p>MockHero generates relationally-consistent data that you can insert directly into CockroachDB using any Postgres-compatible driver. Define your tables with <code>ref</code> fields, request JSON or SQL, and seed your cluster in seconds. Because CockroachDB uses the Postgres wire protocol, the seed script is nearly identical to a standard Postgres seeding workflow.</p>

<h2>Quick Setup</h2>
<pre><code>curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "x-api-key: mh_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
  "tables": [
    {
      "name": "regions",
      "count": 5,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "name", "type": "enum", "params": { "values": ["us-east","us-west","eu-west","ap-south","ap-east"] } },
        { "name": "active", "type": "boolean" }
      ]
    },
    {
      "name": "warehouses",
      "count": 20,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "region_id", "type": "ref", "params": { "ref": "regions.id" } },
        { "name": "name", "type": "company_name" },
        { "name": "address", "type": "street_address" },
        { "name": "capacity", "type": "integer", "params": { "min": 1000, "max": 50000 } }
      ]
    },
    {
      "name": "inventory_items",
      "count": 200,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "warehouse_id", "type": "ref", "params": { "ref": "warehouses.id" } },
        { "name": "sku", "type": "uuid" },
        { "name": "product_name", "type": "product_name" },
        { "name": "quantity", "type": "integer", "params": { "min": 0, "max": 500 } }
      ]
    }
  ],
  "format": "json"
}'</code></pre>

<h2>Step-by-Step Guide</h2>
<h3>1. Install dependencies</h3>
<pre><code>npm install pg</code></pre>

<h3>2. Get your MockHero API key</h3>
<p>Sign up at <a href="https://mockhero.dev/sign-up">mockhero.dev/sign-up</a> and copy your API key.</p>

<h3>3. Write the seed script</h3>
<p>Create <code>seed.mjs</code>:</p>
<pre><code>import pg from "pg";
const { Client } = pg;

const client = new Client({ connectionString: process.env.COCKROACH_URL });
await client.connect();

const res = await fetch("https://api.mockhero.dev/api/v1/generate", {
  method: "POST",
  headers: {
    "x-api-key": process.env.MOCKHERO_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    tables: [
      {
        name: "regions",
        count: 5,
        fields: [
          { name: "id", type: "uuid" },
          { name: "name", type: "enum", params: { values: ["us-east","us-west","eu-west","ap-south","ap-east"] } },
          { name: "active", type: "boolean" },
        ],
      },
      {
        name: "warehouses",
        count: 20,
        fields: [
          { name: "id", type: "uuid" },
          { name: "region_id", type: "ref", params: { ref: "regions.id" } },
          { name: "name", type: "company_name" },
          { name: "address", type: "street_address" },
          { name: "capacity", type: "integer", params: { min: 1000, max: 50000 } },
        ],
      },
      {
        name: "inventory_items",
        count: 200,
        fields: [
          { name: "id", type: "uuid" },
          { name: "warehouse_id", type: "ref", params: { ref: "warehouses.id" } },
          { name: "sku", type: "uuid" },
          { name: "product_name", type: "product_name" },
          { name: "quantity", type: "integer", params: { min: 0, max: 500 } },
        ],
      },
    ],
    format: "json",
  }),
});

const { data } = await res.json();

for (const r of data.regions) {
  await client.query(
    "INSERT INTO regions (id, name, active) VALUES ($1, $2, $3)",
    [r.id, r.name, r.active]
  );
}
for (const w of data.warehouses) {
  await client.query(
    "INSERT INTO warehouses (id, region_id, name, address, capacity) VALUES ($1, $2, $3, $4, $5)",
    [w.id, w.region_id, w.name, w.address, w.capacity]
  );
}
for (const item of data.inventory_items) {
  await client.query(
    "INSERT INTO inventory_items (id, warehouse_id, sku, product_name, quantity) VALUES ($1, $2, $3, $4, $5)",
    [item.id, item.warehouse_id, item.sku, item.product_name, item.quantity]
  );
}

console.log(
  "Seeded", data.regions.length, "regions,",
  data.warehouses.length, "warehouses, and",
  data.inventory_items.length, "inventory items"
);
await client.end();</code></pre>

<h3>4. Run the script</h3>
<pre><code>node seed.mjs</code></pre>

<h3>5. Verify in the CockroachDB SQL shell</h3>
<pre><code>cockroach sql --url "$COCKROACH_URL" -e "SELECT w.name, r.name AS region FROM warehouses w JOIN regions r ON w.region_id = r.id LIMIT 10;"</code></pre>

<h2>Why MockHero vs Faker / Manual Seeds</h2>
<ul>
<li><strong>Distributed-ready volumes</strong> &mdash; easily generate hundreds or thousands of rows to test range splits and multi-node behavior.</li>
<li><strong>Postgres-compatible</strong> &mdash; CockroachDB uses the Postgres wire protocol, so MockHero's output works with any <code>pg</code> driver.</li>
<li><strong>Multi-table relationships</strong> &mdash; regions, warehouses, and inventory items are all linked automatically via <code>ref</code> fields.</li>
</ul>

<h2>Get Started</h2>
<p>Seed your CockroachDB cluster with production-realistic data. <a href="https://mockhero.dev/sign-up">Sign up free at mockhero.dev</a> and get 1,000 rows per month, no credit card required.</p>
`,
  },

  // USE CASE ARTICLES (continued)
  {
    slug: "generate-healthcare-test-data",
    title: "Generate Healthcare Test Data (HIPAA-Safe Synthetic Data)",
    description:
      "Create realistic but completely synthetic healthcare test data for development and QA. MockHero generates patient records, appointments, and medical data with zero HIPAA risk.",
    category: "Use Case",
    date: "2026-03-26",
    author: "MockHero Team",
    content: `
<h2>The Problem</h2>
<p>Healthcare software needs realistic test data, but using real patient records is a non-starter. HIPAA regulations impose severe penalties for unauthorized use of Protected Health Information (PHI), even in development environments. De-identification is complex and error-prone: you have to strip 18 different identifier types and there is always a risk of re-identification.</p>
<p>Most teams resort to absurdly simple test data: five patients named "Test Patient 1" through "Test Patient 5" with identical birth dates. This data does not test date-of-birth validation, insurance eligibility calculations, appointment scheduling logic, or any of the complex business rules that healthcare software depends on.</p>

<h2>The Solution: MockHero Synthetic Healthcare Data</h2>
<p>MockHero generates completely synthetic data that looks realistic but has zero connection to real individuals. Every name, date of birth, insurance number, and medical record is fabricated from scratch. There is no HIPAA risk because no PHI was ever involved. You get the realism needed for thorough testing without the compliance burden.</p>

<h2>Quick Setup</h2>
<pre><code>curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "x-api-key: mh_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
  "tables": [
    {
      "name": "patients",
      "count": 100,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "mrn", "type": "integer", "params": { "min": 100000, "max": 999999 } },
        { "name": "first_name", "type": "first_name" },
        { "name": "last_name", "type": "last_name" },
        { "name": "date_of_birth", "type": "date" },
        { "name": "gender", "type": "enum", "params": { "values": ["Male","Female","Non-binary","Prefer not to say"] } },
        { "name": "blood_type", "type": "enum", "params": { "values": ["A+","A-","B+","B-","O+","O-","AB+","AB-"] } },
        { "name": "insurance_id", "type": "uuid" },
        { "name": "phone", "type": "phone" },
        { "name": "email", "type": "email" }
      ]
    },
    {
      "name": "providers",
      "count": 15,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "full_name", "type": "full_name" },
        { "name": "specialty", "type": "enum", "params": { "values": ["Cardiology","Dermatology","Endocrinology","Gastroenterology","Neurology","Oncology","Orthopedics","Pediatrics","Psychiatry","Radiology"] } },
        { "name": "npi", "type": "integer", "params": { "min": 1000000000, "max": 1999999999 } },
        { "name": "email", "type": "email" }
      ]
    },
    {
      "name": "appointments",
      "count": 500,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "patient_id", "type": "ref", "params": { "ref": "patients.id" } },
        { "name": "provider_id", "type": "ref", "params": { "ref": "providers.id" } },
        { "name": "scheduled_at", "type": "datetime" },
        { "name": "type", "type": "enum", "params": { "values": ["initial_consult","follow_up","physical","lab_work","imaging","procedure","telehealth"] } },
        { "name": "status", "type": "enum", "params": { "values": ["scheduled","checked_in","in_progress","completed","cancelled","no_show"] } },
        { "name": "notes", "type": "sentence" }
      ]
    }
  ],
  "format": "json"
}'</code></pre>

<h2>Step-by-Step Guide</h2>
<h3>1. Define your healthcare schema</h3>
<p>Map your application's patient, provider, and encounter models to MockHero tables. Use <code>enum</code> fields for coded values like blood types, specialties, and appointment statuses to match your real application's constraints.</p>

<h3>2. Get your MockHero API key</h3>
<p>Sign up at <a href="https://mockhero.dev/sign-up">mockhero.dev/sign-up</a> and copy your API key.</p>

<h3>3. Generate the data</h3>
<p>Call the MockHero API with your schema. The response includes patients, providers, and appointments with valid referential links between them.</p>

<h3>4. Load into your database</h3>
<p>Use your preferred database driver or ORM to insert the data. MockHero's JSON output works with any database. For Postgres:</p>
<pre><code>import pg from "pg";
const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const res = await fetch("https://api.mockhero.dev/api/v1/generate", {
  method: "POST",
  headers: {
    "x-api-key": process.env.MOCKHERO_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ /* schema from above */ }),
});
const { data } = await res.json();

for (const p of data.patients) {
  await client.query(
    "INSERT INTO patients (id, mrn, first_name, last_name, date_of_birth, gender, blood_type, insurance_id, phone, email) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
    [p.id, p.mrn, p.first_name, p.last_name, p.date_of_birth, p.gender, p.blood_type, p.insurance_id, p.phone, p.email]
  );
}
// ... insert providers and appointments similarly</code></pre>

<h3>5. Run compliance checks</h3>
<p>Verify that none of the generated data matches real individuals. Because MockHero creates data from scratch (not by modifying real records), there is no risk of accidental PHI exposure.</p>

<h2>Why MockHero vs De-Identified Production Data</h2>
<ul>
<li><strong>Zero HIPAA risk</strong> &mdash; synthetic data has no connection to real patients. No BAA needed for test environments.</li>
<li><strong>Complete control</strong> &mdash; choose exactly which fields, distributions, and volumes you need for testing.</li>
<li><strong>Reproducible</strong> &mdash; pass a <code>seed</code> parameter to get identical data every run, perfect for regression testing.</li>
<li><strong>Fast</strong> &mdash; generate 500 appointments in seconds, not hours of data masking and review.</li>
</ul>

<h2>Get Started</h2>
<p>Generate HIPAA-safe healthcare test data today. <a href="https://mockhero.dev/sign-up">Sign up free at mockhero.dev</a> and get 1,000 rows per month.</p>
`,
  },
  {
    slug: "generate-fintech-test-data",
    title: "Generate Fintech and Banking Test Data with MockHero",
    description:
      "Create realistic transaction data, account records, and financial test data for fintech applications. MockHero generates synthetic banking data with proper distributions and referential integrity.",
    category: "Use Case",
    date: "2026-03-26",
    author: "MockHero Team",
    content: `
<h2>The Problem</h2>
<p>Fintech applications deal with money, and testing with unrealistic data is dangerous. A payment processing system tested with five transactions will not surface rounding errors, currency conversion bugs, or race conditions that only appear under realistic load. But using real financial data in test environments is a compliance nightmare involving PCI-DSS, SOX, and banking regulations.</p>
<p>Building test data for fintech is also structurally complex. You need accounts that belong to customers, transactions that reference both source and destination accounts, balances that make mathematical sense, and statuses that reflect real-world payment processing flows.</p>

<h2>The Solution: MockHero Synthetic Financial Data</h2>
<p>MockHero generates realistic financial test data with proper referential integrity across customers, accounts, and transactions. Use <code>ref</code> fields to link records, <code>integer</code> fields for amounts in cents (avoiding floating point issues), and <code>enum</code> fields for statuses and transaction types. The data is completely synthetic, so there are no compliance concerns.</p>

<h2>Quick Setup</h2>
<pre><code>curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "x-api-key: mh_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
  "tables": [
    {
      "name": "customers",
      "count": 50,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "full_name", "type": "full_name" },
        { "name": "email", "type": "email" },
        { "name": "phone", "type": "phone" },
        { "name": "kyc_status", "type": "enum", "params": { "values": ["pending","verified","rejected","expired"] } },
        { "name": "created_at", "type": "datetime" }
      ]
    },
    {
      "name": "accounts",
      "count": 80,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "customer_id", "type": "ref", "params": { "ref": "customers.id" } },
        { "name": "account_type", "type": "enum", "params": { "values": ["checking","savings","investment","credit"] } },
        { "name": "currency", "type": "enum", "params": { "values": ["USD","EUR","GBP","CAD","AUD"] } },
        { "name": "balance_cents", "type": "integer", "params": { "min": 0, "max": 5000000 } },
        { "name": "status", "type": "enum", "params": { "values": ["active","frozen","closed"] } }
      ]
    },
    {
      "name": "transactions",
      "count": 1000,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "account_id", "type": "ref", "params": { "ref": "accounts.id" } },
        { "name": "amount_cents", "type": "integer", "params": { "min": -500000, "max": 500000 } },
        { "name": "type", "type": "enum", "params": { "values": ["deposit","withdrawal","transfer","payment","refund","fee","interest"] } },
        { "name": "status", "type": "enum", "params": { "values": ["pending","processing","completed","failed","reversed"] } },
        { "name": "description", "type": "sentence" },
        { "name": "created_at", "type": "datetime" }
      ]
    }
  ],
  "format": "json"
}'</code></pre>

<h2>Step-by-Step Guide</h2>
<h3>1. Map your financial domain model</h3>
<p>Identify the core entities in your fintech app: customers, accounts, transactions, payments, transfers. Map each to a MockHero table with the right field types. Use <code>integer</code> for monetary amounts (always in cents to avoid floating point) and <code>enum</code> for statuses and types.</p>

<h3>2. Get your MockHero API key</h3>
<p>Sign up at <a href="https://mockhero.dev/sign-up">mockhero.dev/sign-up</a> and copy your API key.</p>

<h3>3. Generate and insert the data</h3>
<pre><code>const res = await fetch("https://api.mockhero.dev/api/v1/generate", {
  method: "POST",
  headers: {
    "x-api-key": process.env.MOCKHERO_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    tables: [
      // ... schema from above
    ],
    format: "json",
  }),
});

const { data } = await res.json();
// Insert customers first, then accounts, then transactions
// Foreign keys are guaranteed valid by MockHero's ref fields</code></pre>

<h3>4. Test financial logic</h3>
<p>With 1,000 transactions across 80 accounts, you can test balance calculations, transaction filtering, statement generation, and reporting dashboards with realistic data volumes.</p>

<h3>5. Use deterministic seeds for regression tests</h3>
<p>Add a <code>"seed": 42</code> parameter to your MockHero request to get identical data every run. This makes your financial test assertions stable and reproducible.</p>

<h2>Why MockHero vs Manual Financial Test Data</h2>
<ul>
<li><strong>Compliance-safe</strong> &mdash; completely synthetic data means no PCI-DSS, SOX, or banking regulation concerns in test environments.</li>
<li><strong>Integer arithmetic</strong> &mdash; amounts in cents avoid the floating-point bugs that plague financial systems using decimals.</li>
<li><strong>Realistic distributions</strong> &mdash; transaction types and statuses span the full range of your enum values, testing edge cases automatically.</li>
<li><strong>Referential integrity</strong> &mdash; every transaction references a valid account, every account references a valid customer.</li>
</ul>

<h2>Get Started</h2>
<p>Build your fintech test suite on realistic synthetic data. <a href="https://mockhero.dev/sign-up">Sign up free at mockhero.dev</a> and generate 1,000 rows per month.</p>
`,
  },
  {
    slug: "generate-saas-test-data",
    title: "Generate SaaS Multi-Tenant Test Data with MockHero",
    description:
      "Create realistic multi-tenant test data for SaaS applications. MockHero generates organizations, users, roles, and resources with proper tenant isolation built in.",
    category: "Use Case",
    date: "2026-03-26",
    author: "MockHero Team",
    content: `
<h2>The Problem</h2>
<p>Multi-tenant SaaS applications have the most complex data models in software. Every record belongs to a tenant (organization), users have roles within tenants, resources are scoped by tenant, and permissions cross-cut everything. Testing this requires data that spans multiple organizations with overlapping user patterns, and the most critical bugs are tenant isolation failures: when one tenant can see another tenant's data.</p>
<p>Building this test data manually is a nightmare. You need multiple organizations, users in each org with different roles, resources owned by each org, and you need to verify that queries never leak data across tenant boundaries. Most developers test with a single tenant and hope for the best.</p>

<h2>The Solution: MockHero Multi-Tenant Data</h2>
<p>MockHero's <code>ref</code> fields naturally model multi-tenant relationships. Define organizations, then reference them from users, projects, and any other tenant-scoped entity. MockHero ensures every child record belongs to a valid parent organization, giving you the data structure needed to test tenant isolation thoroughly.</p>

<h2>Quick Setup</h2>
<pre><code>curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "x-api-key: mh_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
  "tables": [
    {
      "name": "organizations",
      "count": 10,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "name", "type": "company_name" },
        { "name": "slug", "type": "slug" },
        { "name": "plan", "type": "enum", "params": { "values": ["free","starter","pro","enterprise"] } },
        { "name": "created_at", "type": "datetime" }
      ]
    },
    {
      "name": "users",
      "count": 60,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "org_id", "type": "ref", "params": { "ref": "organizations.id" } },
        { "name": "full_name", "type": "full_name" },
        { "name": "email", "type": "email" },
        { "name": "role", "type": "enum", "params": { "values": ["owner","admin","member","viewer","billing"] } },
        { "name": "invited_at", "type": "datetime" }
      ]
    },
    {
      "name": "projects",
      "count": 100,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "org_id", "type": "ref", "params": { "ref": "organizations.id" } },
        { "name": "created_by", "type": "ref", "params": { "ref": "users.id" } },
        { "name": "name", "type": "sentence" },
        { "name": "description", "type": "paragraphs" },
        { "name": "status", "type": "enum", "params": { "values": ["active","archived","paused"] } }
      ]
    },
    {
      "name": "api_keys",
      "count": 30,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "org_id", "type": "ref", "params": { "ref": "organizations.id" } },
        { "name": "name", "type": "sentence" },
        { "name": "prefix", "type": "uuid" },
        { "name": "last_used_at", "type": "datetime" },
        { "name": "revoked", "type": "boolean" }
      ]
    }
  ],
  "format": "json"
}'</code></pre>

<h2>Step-by-Step Guide</h2>
<h3>1. Model your tenant hierarchy</h3>
<p>Start with your organization table, then add every entity that is tenant-scoped. Use <code>ref</code> fields pointing to <code>organizations.id</code> for every table that belongs to a tenant. This mirrors how you would design RLS (Row Level Security) policies in production.</p>

<h3>2. Get your MockHero API key</h3>
<p>Sign up at <a href="https://mockhero.dev/sign-up">mockhero.dev/sign-up</a> and copy your API key.</p>

<h3>3. Generate the multi-tenant dataset</h3>
<pre><code>const res = await fetch("https://api.mockhero.dev/api/v1/generate", {
  method: "POST",
  headers: {
    "x-api-key": process.env.MOCKHERO_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    tables: [
      // organizations, users, projects, api_keys schema from above
    ],
    format: "json",
  }),
});

const { data } = await res.json();
// data.organizations - 10 tenants
// data.users - 60 users spread across tenants
// data.projects - 100 projects scoped to tenants
// data.api_keys - 30 keys scoped to tenants</code></pre>

<h3>4. Test tenant isolation</h3>
<p>With data spread across 10 organizations, you can write tests that authenticate as a user in org A and verify they cannot access projects belonging to org B. This is the most critical security test for any SaaS application.</p>

<h3>5. Test role-based access</h3>
<p>MockHero's enum fields distribute users across all five roles (owner, admin, member, viewer, billing). Test that each role can only perform its permitted actions within the correct tenant.</p>

<h2>Why MockHero vs Manual Multi-Tenant Seeds</h2>
<ul>
<li><strong>Multi-level relationships</strong> &mdash; organizations own users, projects, and API keys. All foreign keys are valid out of the box.</li>
<li><strong>Isolation testing</strong> &mdash; 10 tenants with distributed data makes it easy to verify that RLS policies and authorization checks work correctly.</li>
<li><strong>Role distribution</strong> &mdash; enum fields ensure all role types are represented, so you test every permission path.</li>
<li><strong>Scalable</strong> &mdash; increase counts to test with 100 tenants and 10,000 users for load testing multi-tenant systems.</li>
</ul>

<h2>Get Started</h2>
<p>Test your SaaS app with realistic multi-tenant data. <a href="https://mockhero.dev/sign-up">Sign up free at mockhero.dev</a> and get 1,000 rows per month.</p>
`,
  },
  {
    slug: "mock-data-for-load-testing",
    title: "Using MockHero for Load Testing and Performance Benchmarks",
    description:
      "Generate large volumes of realistic test data for load testing with k6, Artillery, or JMeter. MockHero produces thousands of unique records to prevent caching artifacts in your benchmarks.",
    category: "Use Case",
    date: "2026-03-26",
    author: "MockHero Team",
    content: `
<h2>The Problem</h2>
<p>Load testing with unrealistic data produces unrealistic results. When every simulated request uses the same five test accounts, your database caches aggressively, indexes stay hot, and the benchmark looks great. In production, thousands of unique users with different data patterns hit cold paths, trigger cache misses, and expose performance bottlenecks that your load test completely missed.</p>
<p>The other problem is volume. Load tests need thousands or millions of unique records, but generating that data is a project in itself. Faker.js can produce the values, but you need to handle uniqueness (no duplicate emails), relational consistency (valid foreign keys), and realistic distributions. By the time you have built the data generator, you have spent more time on test setup than on the test itself.</p>

<h2>The Solution: MockHero for Load Test Data</h2>
<p>MockHero generates large volumes of unique, relationally-consistent data in a single API call. Every email is unique, every foreign key is valid, and the data looks like a real production database. Pipe the output into your database before a load test, and your benchmarks will reflect real-world performance.</p>

<h2>Quick Setup</h2>
<pre><code>curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "x-api-key: mh_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
  "tables": [
    {
      "name": "users",
      "count": 5000,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "email", "type": "email" },
        { "name": "username", "type": "username" },
        { "name": "password_hash", "type": "uuid" },
        { "name": "plan", "type": "enum", "params": { "values": ["free","basic","pro","enterprise"] } },
        { "name": "created_at", "type": "datetime" }
      ]
    },
    {
      "name": "api_requests",
      "count": 50000,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "user_id", "type": "ref", "params": { "ref": "users.id" } },
        { "name": "method", "type": "enum", "params": { "values": ["GET","POST","PUT","DELETE","PATCH"] } },
        { "name": "path", "type": "slug" },
        { "name": "status_code", "type": "enum", "params": { "values": ["200","201","400","401","403","404","500"] } },
        { "name": "latency_ms", "type": "integer", "params": { "min": 5, "max": 2000 } },
        { "name": "created_at", "type": "datetime" }
      ]
    }
  ],
  "format": "json"
}'</code></pre>

<h2>Step-by-Step Guide</h2>
<h3>1. Determine your data volume needs</h3>
<p>A good rule of thumb: your test database should have at least as many records as you expect in production. If you have 10,000 users in production, generate at least 10,000 for your load test. This ensures indexes, query plans, and cache behavior match reality.</p>

<h3>2. Get your MockHero API key</h3>
<p>Sign up at <a href="https://mockhero.dev/sign-up">mockhero.dev/sign-up</a>. For load testing volumes, you may want a paid plan that supports higher row counts.</p>

<h3>3. Generate and seed the data</h3>
<p>Use MockHero's SQL output format for fastest insertion:</p>
<pre><code># Generate SQL and pipe directly to your database
curl -s -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "x-api-key: mh_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{ "tables": [...], "format": "sql" }' \\
  | psql $DATABASE_URL</code></pre>

<h3>4. Configure your load test tool</h3>
<p>Use the generated user IDs in your load test scripts. Here is a k6 example:</p>
<pre><code>import http from "k6/http";
import { check } from "k6";

// Pre-loaded user IDs from MockHero data
const userIds = JSON.parse(open("./user-ids.json"));

export const options = {
  stages: [
    { duration: "1m", target: 100 },
    { duration: "5m", target: 500 },
    { duration: "1m", target: 0 },
  ],
};

export default function () {
  const userId = userIds[Math.floor(Math.random() * userIds.length)];
  const res = http.get(\`http://localhost:3000/api/users/\${userId}\`);
  check(res, { "status is 200": (r) => r.status === 200 });
}</code></pre>

<h3>5. Run the benchmark and analyze</h3>
<p>Because every request hits a different user record, your load test exercises the full range of database and cache behavior. Compare results against benchmarks with small datasets to see the true performance difference.</p>

<h2>Why MockHero vs Faker for Load Testing</h2>
<ul>
<li><strong>Unique records</strong> &mdash; every email, username, and ID is guaranteed unique. No duplicate key errors during seeding.</li>
<li><strong>Volume</strong> &mdash; generate thousands of rows in a single API call. No local script to run and debug.</li>
<li><strong>Realistic distributions</strong> &mdash; data that mimics real-world patterns, so your benchmarks reflect actual production behavior.</li>
<li><strong>SQL output</strong> &mdash; pipe INSERT statements directly into your database for fastest possible seeding.</li>
</ul>

<h2>Get Started</h2>
<p>Make your load tests trustworthy with realistic data volumes. <a href="https://mockhero.dev/sign-up">Sign up at mockhero.dev</a> and generate the test data your benchmarks deserve.</p>
`,
  },
  {
    slug: "api-prototype-with-mock-data",
    title: "Rapid API Prototyping with Synthetic Data from MockHero",
    description:
      "Ship API prototypes faster by generating realistic response data with MockHero. Build frontend demos, client presentations, and proof-of-concepts without waiting for a real backend.",
    category: "Use Case",
    date: "2026-03-26",
    author: "MockHero Team",
    content: `
<h2>The Problem</h2>
<p>You need to demo an API to a client, present a proof-of-concept to stakeholders, or build a frontend while the backend team is still designing the schema. In all these cases, you need realistic API responses <em>now</em>, but the real API does not exist yet. The usual workaround is to hardcode JSON files with three or four records, which looks unconvincing and does not test pagination, filtering, or error handling.</p>
<p>Mock servers like JSON Server or MSW solve the routing problem but not the data problem. You still need to create the data yourself, and hardcoded fixtures do not scale when you want to demonstrate search, sorting, or paginated lists with hundreds of results.</p>

<h2>The Solution: MockHero as Your Prototype Data Layer</h2>
<p>MockHero generates large, realistic datasets that you can use as mock API responses. Define your API's data shape as a MockHero schema, generate the data, and serve it through a simple static server or integrate it into your mock server. The result is an API prototype that looks and feels like a production system.</p>

<h2>Quick Setup</h2>
<pre><code>curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "x-api-key: mh_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
  "tables": [
    {
      "name": "products",
      "count": 200,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "name", "type": "product_name" },
        { "name": "description", "type": "paragraphs" },
        { "name": "price", "type": "integer", "params": { "min": 499, "max": 29999 } },
        { "name": "category", "type": "enum", "params": { "values": ["electronics","clothing","home","sports","books"] } },
        { "name": "image_url", "type": "avatar_url" },
        { "name": "rating", "type": "integer", "params": { "min": 1, "max": 5 } },
        { "name": "in_stock", "type": "boolean" }
      ]
    },
    {
      "name": "reviews",
      "count": 800,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "product_id", "type": "ref", "params": { "ref": "products.id" } },
        { "name": "author", "type": "full_name" },
        { "name": "rating", "type": "integer", "params": { "min": 1, "max": 5 } },
        { "name": "comment", "type": "paragraphs" },
        { "name": "created_at", "type": "datetime" }
      ]
    }
  ],
  "format": "json"
}'</code></pre>

<h2>Step-by-Step Guide</h2>
<h3>1. Define your API shape</h3>
<p>Start with the API endpoints you need to prototype. For each endpoint, map the response body to a MockHero table. If an endpoint returns nested data (products with reviews), use <code>ref</code> fields to link the tables.</p>

<h3>2. Get your MockHero API key</h3>
<p>Sign up at <a href="https://mockhero.dev/sign-up">mockhero.dev/sign-up</a> and copy your API key.</p>

<h3>3. Generate the data and save locally</h3>
<pre><code># Save to a JSON file for your mock server
curl -s -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "x-api-key: mh_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{ ... }' > mock-data.json</code></pre>

<h3>4. Serve through a mock API</h3>
<p>Use Express to create a quick mock API:</p>
<pre><code>import express from "express";
import { readFileSync } from "fs";

const app = express();
const data = JSON.parse(readFileSync("./mock-data.json", "utf-8")).data;

app.get("/api/products", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const start = (page - 1) * limit;
  res.json({
    data: data.products.slice(start, start + limit),
    total: data.products.length,
    page,
    pages: Math.ceil(data.products.length / limit),
  });
});

app.get("/api/products/:id", (req, res) => {
  const product = data.products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "Not found" });
  const reviews = data.reviews.filter(r => r.product_id === product.id);
  res.json({ ...product, reviews });
});

app.listen(3001, () => console.log("Mock API running on port 3001"));</code></pre>

<h3>5. Build your frontend against the mock API</h3>
<p>Your frontend can now fetch paginated product lists, display product details with reviews, and handle empty states. When the real backend is ready, just swap the base URL. The data shapes are already correct.</p>

<h2>Why MockHero vs Hardcoded Fixtures</h2>
<ul>
<li><strong>Volume</strong> &mdash; 200 products and 800 reviews make pagination, search, and filtering feel real. Five hardcoded records do not.</li>
<li><strong>Realistic content</strong> &mdash; product names, descriptions, and reviews look like real data, which makes demos and presentations convincing.</li>
<li><strong>Relational</strong> &mdash; reviews are properly linked to products. Your frontend can display review counts and average ratings correctly.</li>
<li><strong>Fast iteration</strong> &mdash; change the schema, regenerate, and your prototype has new data in seconds.</li>
</ul>

<h2>Get Started</h2>
<p>Ship your API prototype in hours, not weeks. <a href="https://mockhero.dev/sign-up">Sign up free at mockhero.dev</a> and generate the realistic data your prototype deserves.</p>
`,
  },

  // ============================================================
  // COMPARISONS
  // ============================================================
  {
    slug: "mockhero-vs-faker-js",
    title: "MockHero vs Faker.js: Which Test Data Tool Should You Use?",
    description:
      "A practical comparison of MockHero and Faker.js for generating realistic test data. Covers setup, relational data, output formats, locales, and when each tool wins.",
    category: "Use Case",
    date: "2026-04-02",
    author: "MockHero Team",
    content: `
<h2>TL;DR</h2>
<p>Faker.js is a great local library for sprinkling random values into tests. MockHero is an API that returns entire relational datasets in one call — with foreign keys, deterministic seeds, and JSON/CSV/SQL output ready to insert into your database. Use Faker for inline fixtures; use MockHero when you need a <em>dataset</em>, not a field.</p>

<h2>At a Glance</h2>
<ul>
<li><strong>Faker.js</strong> — npm library, returns one value at a time, you build the loop.</li>
<li><strong>MockHero</strong> — single API call returns the whole dataset with foreign-key integrity.</li>
<li><strong>Faker.js</strong> — JavaScript only.</li>
<li><strong>MockHero</strong> — language-agnostic (any HTTP client works).</li>
<li><strong>Faker.js</strong> — you write the schema glue code.</li>
<li><strong>MockHero</strong> — declare tables and <code>ref</code> fields; relations are automatic.</li>
</ul>

<h2>The Same Task, Both Ways</h2>
<p>Goal: 20 users and 100 posts, each post belongs to a user.</p>

<h3>Faker.js</h3>
<pre><code>import { faker } from "@faker-js/faker";

const users = Array.from({ length: 20 }, () => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
}));

const posts = Array.from({ length: 100 }, () => ({
  id: faker.string.uuid(),
  user_id: faker.helpers.arrayElement(users).id,
  title: faker.lorem.sentence(),
  body: faker.lorem.paragraphs(2),
}));</code></pre>

<h3>MockHero</h3>
<pre><code>curl -X POST https://api.mockhero.dev/api/v1/generate \\
  -H "x-api-key: mh_your_api_key" \\
  -d '{
  "tables": [
    { "name": "users", "count": 20, "fields": [
      { "name": "id", "type": "uuid" },
      { "name": "name", "type": "full_name" },
      { "name": "email", "type": "email" }
    ]},
    { "name": "posts", "count": 100, "fields": [
      { "name": "id", "type": "uuid" },
      { "name": "user_id", "type": "ref", "ref": "users.id" },
      { "name": "title", "type": "sentence" },
      { "name": "body", "type": "paragraphs" }
    ]}
  ]
}'</code></pre>

<h2>Where MockHero Wins</h2>
<ul>
<li><strong>Relational data is declarative.</strong> <code>ref</code> fields mean no hand-wiring foreign keys.</li>
<li><strong>Output formats.</strong> Return JSON, CSV, or ready-to-run SQL INSERT statements.</li>
<li><strong>Deterministic seeds.</strong> Pass <code>seed</code> and CI gets the same dataset every time.</li>
<li><strong>Language-agnostic.</strong> Python, Go, Ruby, Rust — any HTTP client works.</li>
<li><strong>Zero maintenance.</strong> No package upgrades, no transitive vulns.</li>
</ul>

<h2>Where Faker.js Wins</h2>
<ul>
<li>Offline unit tests that don't touch the network.</li>
<li>Generating a single random value inline.</li>
<li>Projects with no budget for any paid tool (though MockHero has a free tier).</li>
</ul>

<h2>Combine Them</h2>
<p>Many teams use both: Faker.js in unit tests for single-value stubs, MockHero for full seed datasets and staging environments. The two aren't mutually exclusive.</p>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Grab a free MockHero API key</a> and generate a relational dataset in your first minute.</p>
`,
  },
  {
    slug: "mockhero-vs-mockaroo",
    title: "MockHero vs Mockaroo: A Developer-Focused Comparison",
    description:
      "Mockaroo and MockHero both generate mock data, but the workflows are very different. Compare API, relational support, pricing, and developer experience.",
    category: "Use Case",
    date: "2026-04-02",
    author: "MockHero Team",
    content: `
<h2>TL;DR</h2>
<p>Mockaroo popularized browser-based mock data generation. MockHero is the API-first successor: schema-as-code, first-class relational support, deterministic seeds, and an MCP server for AI coding agents. If you live in the terminal, MockHero fits the workflow better.</p>

<h2>Workflow Differences</h2>
<ul>
<li><strong>Mockaroo</strong> — build your schema in a web UI, export a file or hit their API.</li>
<li><strong>MockHero</strong> — define schema in JSON or plain English, POST to the API, ship the response into your DB.</li>
</ul>

<h2>Relational Data</h2>
<p>Mockaroo supports relational fields, but wiring them requires navigating the UI and tends to break when schemas evolve. MockHero's <code>ref</code> fields live next to the schema — check them into git, diff them in PRs, and regenerate.</p>

<pre><code>{
  "tables": [
    { "name": "customers", "count": 50, "fields": [
      { "name": "id", "type": "uuid" },
      { "name": "name", "type": "company_name" }
    ]},
    { "name": "orders", "count": 200, "fields": [
      { "name": "customer_id", "type": "ref", "ref": "customers.id" },
      { "name": "total", "type": "price" }
    ]}
  ]
}</code></pre>

<h2>Output Formats</h2>
<ul>
<li><strong>Mockaroo</strong> — CSV, JSON, SQL, Excel, XML.</li>
<li><strong>MockHero</strong> — JSON, CSV, and dialect-aware SQL (PostgreSQL, MySQL, SQLite).</li>
</ul>

<h2>AI and MCP</h2>
<p>MockHero ships an MCP server so Claude Code, Cursor, and Windsurf can generate test data directly from your coding agent. Mockaroo doesn't have a native AI integration today.</p>

<pre><code>npx @mockherodev/mcp-server</code></pre>

<h2>Pricing Model</h2>
<p>Both offer free tiers. MockHero's free tier includes 1,000 rows/month with no credit card. Paid plans scale by rows/month rather than schemas or seats.</p>

<h2>When Mockaroo Still Wins</h2>
<ul>
<li>You prefer a visual schema builder and don't write code.</li>
<li>You need a format MockHero doesn't emit (e.g., Excel).</li>
</ul>

<h2>When MockHero Wins</h2>
<ul>
<li>Your schemas live in git and change often.</li>
<li>You want deterministic CI-friendly seeds.</li>
<li>You use an AI coding agent and want inline test data.</li>
</ul>

<h2>Try MockHero</h2>
<p><a href="https://mockhero.dev/sign-up">Sign up for a free API key</a> and generate your first relational dataset in under a minute.</p>
`,
  },
  {
    slug: "mockhero-vs-json-generator",
    title: "MockHero vs JSON Generator: Beyond Static Mock Files",
    description:
      "JSON Generator is great for one-off mocks. MockHero is built for relational, repeatable, production-style test data. Here's how they compare.",
    category: "Use Case",
    date: "2026-04-03",
    author: "MockHero Team",
    content: `
<h2>TL;DR</h2>
<p>JSON Generator gives you a quick JSON blob for a prototype. MockHero gives you a repeatable, versioned, relational dataset you can re-seed on every CI run.</p>

<h2>Mental Model</h2>
<ul>
<li><strong>JSON Generator</strong> — template language renders a random JSON tree.</li>
<li><strong>MockHero</strong> — declarative schema of tables, fields, and refs. Call it from code. Re-run it with a seed.</li>
</ul>

<h2>Relational Data</h2>
<p>JSON Generator can reference other fields within a document, but cross-table foreign keys across <em>hundreds of rows</em> get clumsy fast. MockHero was built for this case. A single API call returns every row in every table, all wired together.</p>

<h2>Determinism</h2>
<p>MockHero accepts a <code>seed</code> parameter that makes regeneration deterministic. JSON Generator is non-deterministic by default.</p>

<pre><code>{ "seed": 42, "tables": [/* ... */] }</code></pre>

<h2>Database-Ready Output</h2>
<p>MockHero emits SQL INSERT statements with correct quoting for PostgreSQL, MySQL, and SQLite. JSON Generator only emits JSON — you'd write the conversion yourself.</p>

<h2>Use the Right Tool</h2>
<ul>
<li><strong>JSON Generator</strong> — a single mock response for a prototype.</li>
<li><strong>MockHero</strong> — seeding a whole dev/staging/CI environment.</li>
</ul>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Create a free MockHero account</a> and generate your first relational dataset in seconds.</p>
`,
  },
  {
    slug: "mockhero-vs-factory-bot",
    title: "MockHero vs factory_bot: Rails Seed Data, Compared",
    description:
      "factory_bot is the Rails testing classic. MockHero offers a language-agnostic API with relational integrity built in. Here's when to use each.",
    category: "Use Case",
    date: "2026-04-03",
    author: "MockHero Team",
    content: `
<h2>TL;DR</h2>
<p>factory_bot is excellent for per-test Ruby object factories. MockHero is better when you need a big realistic dataset across many tables, or when your stack isn't Ruby-only.</p>

<h2>Scope</h2>
<ul>
<li><strong>factory_bot</strong> — Ruby library, per-object factories inside RSpec/Minitest.</li>
<li><strong>MockHero</strong> — HTTP API, whole-dataset generation, usable from Ruby, JS, Python, Go, anything.</li>
</ul>

<h2>Seeding Ruby on Rails</h2>
<pre><code># db/seeds.rb
require "net/http"
require "json"
require "active_record"

body = {
  tables: [
    { name: "users", count: 100, fields: [
      { name: "id", type: "uuid" },
      { name: "email", type: "email" }
    ]},
    { name: "posts", count: 500, fields: [
      { name: "user_id", type: "ref", ref: "users.id" },
      { name: "title", type: "sentence" }
    ]}
  ]
}

res = Net::HTTP.post(
  URI("https://api.mockhero.dev/api/v1/generate"),
  body.to_json,
  "Content-Type" => "application/json",
  "x-api-key" => ENV["MOCKHERO_API_KEY"]
)

data = JSON.parse(res.body)
User.insert_all(data["users"])
Post.insert_all(data["posts"])</code></pre>

<h2>When to Combine</h2>
<p>Use factory_bot in unit tests for per-test fixtures. Use MockHero in <code>db/seeds.rb</code> and in CI so every developer and every CI run starts with the same realistic 10,000-row dataset.</p>

<h2>Realism</h2>
<p>MockHero ships 156+ field types (addresses, company names, product SKUs, avatars). factory_bot is neutral about the values — you wire in Faker or write literals. MockHero gives you quality defaults out of the box.</p>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Grab a free API key</a> and point your <code>db/seeds.rb</code> at MockHero.</p>
`,
  },
  {
    slug: "mockhero-vs-mimesis",
    title: "MockHero vs Mimesis: Python Test Data, Compared",
    description:
      "Mimesis is a popular Python faker. MockHero is a language-agnostic API with relational support out of the box. Compare setup, speed, and realism.",
    category: "Use Case",
    date: "2026-04-04",
    author: "MockHero Team",
    content: `
<h2>TL;DR</h2>
<p>Mimesis is fast and Python-native for per-field fakes. MockHero is the right tool when you need an entire relational dataset in one call, across any language — and when multiple services need to share the same seeded data.</p>

<h2>The Relational Gap</h2>
<p>Mimesis generates fields. If you want 500 orders that reference 50 customers, you still write the loop and keep track of IDs yourself. MockHero makes that a schema declaration.</p>

<pre><code>import requests, os

body = {
  "tables": [
    {"name": "customers", "count": 50, "fields": [
      {"name": "id", "type": "uuid"},
      {"name": "name", "type": "full_name"}
    ]},
    {"name": "orders", "count": 500, "fields": [
      {"name": "id", "type": "uuid"},
      {"name": "customer_id", "type": "ref", "ref": "customers.id"},
      {"name": "total", "type": "price"}
    ]}
  ]
}

res = requests.post(
  "https://api.mockhero.dev/api/v1/generate",
  json=body,
  headers={"x-api-key": os.environ["MOCKHERO_API_KEY"]}
)

data = res.json()</code></pre>

<h2>Cross-Service Consistency</h2>
<p>Microservice architectures often have many languages. With Mimesis, your Python service seeds its own data, your Go service seeds its own, and reconciling is hard. With MockHero, all services hit the same endpoint with the same <code>seed</code> and receive identical datasets.</p>

<h2>When Mimesis Still Wins</h2>
<ul>
<li>Offline, local, pure-Python unit tests.</li>
<li>Very fine-grained control over specific Python-only data types.</li>
</ul>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Sign up for MockHero free</a> and drop a <code>requests.post</code> into your seed script.</p>
`,
  },
  {
    slug: "mockhero-vs-bogus-dotnet",
    title: "MockHero vs Bogus (.NET): Which Should C# Developers Use?",
    description:
      "Bogus is the Faker port for .NET. MockHero is a language-agnostic API with relational integrity. Here's when each one makes sense for C# teams.",
    category: "Use Case",
    date: "2026-04-04",
    author: "MockHero Team",
    content: `
<h2>TL;DR</h2>
<p>Bogus is great for in-memory fake objects in xUnit/NUnit tests. MockHero is the better choice when you need a big relational dataset for EF Core migrations, staging environments, or demos.</p>

<h2>Seeding EF Core with MockHero</h2>
<pre><code>using var http = new HttpClient();
http.DefaultRequestHeaders.Add("x-api-key", Env.Get("MOCKHERO_API_KEY"));

var body = new {
  tables = new object[] {
    new { name = "Customers", count = 100, fields = new object[] {
      new { name = "Id", type = "uuid" },
      new { name = "Email", type = "email" }
    }},
    new { name = "Orders", count = 500, fields = new object[] {
      new { name = "Id", type = "uuid" },
      new { name = "CustomerId", type = "ref", @ref = "Customers.Id" },
      new { name = "Total", type = "price" }
    }}
  }
};

var res = await http.PostAsJsonAsync(
  "https://api.mockhero.dev/api/v1/generate", body);
var data = await res.Content.ReadFromJsonAsync&lt;JsonDocument&gt;();</code></pre>

<h2>Why MockHero Scales Better</h2>
<ul>
<li><strong>Relational integrity</strong> out of the box via <code>ref</code> fields.</li>
<li><strong>SQL output</strong> — ship INSERT statements straight into SQL Server.</li>
<li><strong>Shared datasets</strong> — every developer and every CI run seeds the same realistic 10,000-row database with a <code>seed</code> parameter.</li>
</ul>

<h2>When Bogus Still Wins</h2>
<ul>
<li>Per-test in-memory fakes inside unit tests.</li>
<li>Tight, offline feedback loops where network calls are unwanted.</li>
</ul>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Grab a free API key</a> and wire MockHero into your EF Core seeder.</p>
`,
  },
  {
    slug: "mockhero-vs-gretel",
    title: "MockHero vs Gretel: Synthetic Data for Developers",
    description:
      "Gretel focuses on privacy-preserving synthetic data trained on real datasets. MockHero is a developer-first test data API. Which one do you need?",
    category: "Use Case",
    date: "2026-04-05",
    author: "MockHero Team",
    content: `
<h2>TL;DR</h2>
<p>Gretel is a data-science platform for privacy-preserving synthetic data trained on your actual production data. MockHero is a developer tool for seeding databases and mocking APIs. Different problems, different tools.</p>

<h2>Who Each Tool Serves</h2>
<ul>
<li><strong>Gretel</strong> — data scientists and ML engineers who need statistically faithful synthetic datasets derived from real data (often for model training without exposing PII).</li>
<li><strong>MockHero</strong> — software engineers who need realistic, relational fake data in a dev or CI environment. Not trained on your production data.</li>
</ul>

<h2>Setup Effort</h2>
<ul>
<li><strong>Gretel</strong> — upload data, train a model, generate synthetic output. Minutes to hours depending on dataset size.</li>
<li><strong>MockHero</strong> — one API call. Milliseconds.</li>
</ul>

<h2>When to Pick Each</h2>
<ul>
<li>Use <strong>Gretel</strong> if you need synthetic data <em>statistically faithful</em> to your production data for ML, analytics, or regulated sharing.</li>
<li>Use <strong>MockHero</strong> if you need a big relational dataset for local dev, CI tests, demos, or API prototypes.</li>
</ul>

<h2>Can You Use Both?</h2>
<p>Yes. Teams often use Gretel to generate privacy-safe sharing datasets and MockHero to fill dev environments with realistic 10,000-row tables. They aren't competitors; they occupy different layers.</p>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Create a free MockHero account</a> and generate your first relational dataset in seconds.</p>
`,
  },
  {
    slug: "mockhero-vs-tonic",
    title: "MockHero vs Tonic.ai: Enterprise Data vs Developer Simplicity",
    description:
      "Tonic.ai targets enterprise data masking. MockHero targets developers who need fast, realistic test data. Here's how to choose.",
    category: "Use Case",
    date: "2026-04-05",
    author: "MockHero Team",
    content: `
<h2>TL;DR</h2>
<p>Tonic.ai is an enterprise platform for masking production data before sharing it with dev or test environments. MockHero is a developer API for generating synthetic data from scratch. Very different shapes of problem.</p>

<h2>Key Difference</h2>
<ul>
<li><strong>Tonic</strong> — starts from your real production data, anonymizes it, and ships a safe clone.</li>
<li><strong>MockHero</strong> — starts from a schema and generates fresh synthetic data that never touched production.</li>
</ul>

<h2>Cost and Complexity</h2>
<p>Tonic is priced for enterprise (annual contracts, VPC deployments). MockHero is usage-based with a free tier — you can be generating data in under a minute.</p>

<h2>Compliance Angle</h2>
<ul>
<li>Tonic helps with <strong>sharing real data</strong> while staying compliant (GDPR/HIPAA) by masking PII.</li>
<li>MockHero sidesteps compliance entirely by <strong>never using real data</strong>. There's no PII to leak.</li>
</ul>

<h2>When to Pick Each</h2>
<ul>
<li>Pick <strong>Tonic</strong> if analytics and statistical fidelity to production matter, and you have budget and a compliance team.</li>
<li>Pick <strong>MockHero</strong> if you're a developer who needs a seeded database <em>now</em>, or if your org can't (or won't) export production data at all.</li>
</ul>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Sign up for MockHero free</a> — 1,000 rows/month, no credit card.</p>
`,
  },

  // ============================================================
  // STACK COMBOS
  // ============================================================
  {
    slug: "nextjs-supabase-test-data",
    title: "Seed a Next.js + Supabase App with Realistic Test Data",
    description:
      "Generate relational test data for a Next.js app backed by Supabase in one API call. Includes a drop-in seed script with foreign keys and RLS-safe inserts.",
    category: "Framework",
    date: "2026-04-06",
    author: "MockHero Team",
    content: `
<h2>The Setup</h2>
<p>You have a Next.js App Router project with a Supabase Postgres backend. You want 100 users, 500 posts, and 2,000 comments that are relationally consistent — locally and in CI.</p>

<h2>Seed Script</h2>
<pre><code>// scripts/seed.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const res = await fetch("https://api.mockhero.dev/api/v1/generate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.MOCKHERO_API_KEY!,
  },
  body: JSON.stringify({
    seed: 42,
    tables: [
      { name: "profiles", count: 100, fields: [
        { name: "id", type: "uuid" },
        { name: "full_name", type: "full_name" },
        { name: "email", type: "email" }
      ]},
      { name: "posts", count: 500, fields: [
        { name: "id", type: "uuid" },
        { name: "user_id", type: "ref", ref: "profiles.id" },
        { name: "title", type: "sentence" },
        { name: "body", type: "paragraphs" }
      ]},
      { name: "comments", count: 2000, fields: [
        { name: "id", type: "uuid" },
        { name: "post_id", type: "ref", ref: "posts.id" },
        { name: "author_id", type: "ref", ref: "profiles.id" },
        { name: "body", type: "paragraph" }
      ]}
    ]
  })
});

const data = await res.json();
await supabase.from("profiles").insert(data.profiles);
await supabase.from("posts").insert(data.posts);
await supabase.from("comments").insert(data.comments);</code></pre>

<h2>RLS Note</h2>
<p>Use the service-role key in the seed script — anon key inserts will be blocked by RLS. Never ship the service-role key to the browser.</p>

<h2>Run It</h2>
<pre><code>npx tsx scripts/seed.ts</code></pre>

<h2>Why This Is Better Than Manual INSERTs</h2>
<ul>
<li>Foreign keys wired automatically via <code>ref</code>.</li>
<li>Deterministic — same <code>seed</code> gives identical data on every run.</li>
<li>One file, readable in code review.</li>
</ul>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Sign up free</a> and drop this script into your Next.js repo.</p>
`,
  },
  {
    slug: "nextjs-prisma-postgres-test-data",
    title: "Seed Next.js + Prisma + Postgres with MockHero",
    description:
      "A ready-to-run seed script for the Next.js + Prisma + Postgres stack using the MockHero API. Relational data, deterministic seeds, zero manual INSERTs.",
    category: "Framework",
    date: "2026-04-06",
    author: "MockHero Team",
    content: `
<h2>The Setup</h2>
<p>A Next.js App Router app with Prisma pointed at Postgres. Drop this script into <code>prisma/seed.ts</code> and wire it up via <code>package.json</code>.</p>

<pre><code>// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const res = await fetch("https://api.mockhero.dev/api/v1/generate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.MOCKHERO_API_KEY!,
  },
  body: JSON.stringify({
    tables: [
      { name: "User", count: 50, fields: [
        { name: "id", type: "uuid" },
        { name: "email", type: "email" },
        { name: "name", type: "full_name" }
      ]},
      { name: "Post", count: 200, fields: [
        { name: "id", type: "uuid" },
        { name: "authorId", type: "ref", ref: "User.id" },
        { name: "title", type: "sentence" },
        { name: "published", type: "boolean" }
      ]}
    ]
  })
});

const data = await res.json();
await prisma.user.createMany({ data: data.User });
await prisma.post.createMany({ data: data.Post });</code></pre>

<pre><code>// package.json
{
  "prisma": { "seed": "tsx prisma/seed.ts" }
}</code></pre>

<p>Run <code>npx prisma db seed</code>. Done.</p>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Get a free API key</a>.</p>
`,
  },
  {
    slug: "nextjs-drizzle-neon-test-data",
    title: "Seed Next.js + Drizzle + Neon with MockHero",
    description:
      "End-to-end seed script for Next.js + Drizzle ORM + Neon Postgres. Relational test data in one API call, inserted via Drizzle's type-safe bulk insert.",
    category: "Framework",
    date: "2026-04-07",
    author: "MockHero Team",
    content: `
<h2>The Setup</h2>
<p>Next.js App Router, Drizzle ORM, Neon serverless Postgres. Goal: realistic users, projects, and tasks with correct foreign keys.</p>

<pre><code>// scripts/seed.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { users, projects, tasks } from "@/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const res = await fetch("https://api.mockhero.dev/api/v1/generate", {
  method: "POST",
  headers: { "x-api-key": process.env.MOCKHERO_API_KEY!, "Content-Type": "application/json" },
  body: JSON.stringify({
    tables: [
      { name: "users", count: 30, fields: [
        { name: "id", type: "uuid" },
        { name: "email", type: "email" }
      ]},
      { name: "projects", count: 80, fields: [
        { name: "id", type: "uuid" },
        { name: "owner_id", type: "ref", ref: "users.id" },
        { name: "name", type: "product_name" }
      ]},
      { name: "tasks", count: 400, fields: [
        { name: "id", type: "uuid" },
        { name: "project_id", type: "ref", ref: "projects.id" },
        { name: "title", type: "sentence" }
      ]}
    ]
  })
});

const data = await res.json();
await db.insert(users).values(data.users);
await db.insert(projects).values(data.projects);
await db.insert(tasks).values(data.tasks);</code></pre>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Create a free MockHero key</a> and point your Drizzle seed script at it.</p>
`,
  },
  {
    slug: "react-firebase-test-data",
    title: "Generate Test Data for React + Firebase Apps",
    description:
      "Seed Firestore with realistic, relational test data for React apps using the MockHero API. Complete Node.js script included.",
    category: "Framework",
    date: "2026-04-07",
    author: "MockHero Team",
    content: `
<h2>The Setup</h2>
<p>React frontend with Firebase Firestore. You want a realistic local dataset so your UI renders like production.</p>

<pre><code>// scripts/seed.mjs
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp({ credential: cert("./service-account.json") });
const db = getFirestore();

const res = await fetch("https://api.mockhero.dev/api/v1/generate", {
  method: "POST",
  headers: { "x-api-key": process.env.MOCKHERO_API_KEY, "Content-Type": "application/json" },
  body: JSON.stringify({
    tables: [
      { name: "users", count: 50, fields: [
        { name: "id", type: "uuid" },
        { name: "displayName", type: "full_name" },
        { name: "photoURL", type: "avatar_url" }
      ]},
      { name: "posts", count: 200, fields: [
        { name: "id", type: "uuid" },
        { name: "userId", type: "ref", ref: "users.id" },
        { name: "title", type: "sentence" }
      ]}
    ]
  })
});

const data = await res.json();
const batch = db.batch();
for (const u of data.users) batch.set(db.collection("users").doc(u.id), u);
for (const p of data.posts) batch.set(db.collection("posts").doc(p.id), p);
await batch.commit();</code></pre>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Grab a free API key</a>.</p>
`,
  },
  {
    slug: "vue-supabase-test-data",
    title: "Seed a Vue + Supabase App with MockHero",
    description:
      "Complete seed script for Vue 3 + Supabase using MockHero. Relational data, deterministic seeds, service-role inserts that bypass RLS.",
    category: "Framework",
    date: "2026-04-08",
    author: "MockHero Team",
    content: `
<h2>The Setup</h2>
<p>Vue 3 (Vite) frontend on Supabase Postgres. You want a consistent local dataset without writing a line of SQL.</p>

<pre><code>// scripts/seed.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const data = await fetch("https://api.mockhero.dev/api/v1/generate", {
  method: "POST",
  headers: { "x-api-key": process.env.MOCKHERO_API_KEY!, "Content-Type": "application/json" },
  body: JSON.stringify({
    tables: [
      { name: "stores", count: 10, fields: [
        { name: "id", type: "uuid" },
        { name: "name", type: "company_name" }
      ]},
      { name: "products", count: 100, fields: [
        { name: "id", type: "uuid" },
        { name: "store_id", type: "ref", ref: "stores.id" },
        { name: "name", type: "product_name" },
        { name: "price", type: "price" }
      ]}
    ]
  })
}).then(r => r.json());

await supabase.from("stores").insert(data.stores);
await supabase.from("products").insert(data.products);</code></pre>

<h2>Run It</h2>
<pre><code>npx tsx scripts/seed.ts</code></pre>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Free API key here</a>.</p>
`,
  },
  {
    slug: "sveltekit-drizzle-test-data",
    title: "Seed SvelteKit + Drizzle with Realistic Test Data",
    description:
      "Drop-in seed script for SvelteKit apps using Drizzle ORM. Generate relational data via the MockHero API and insert with Drizzle in one file.",
    category: "Framework",
    date: "2026-04-08",
    author: "MockHero Team",
    content: `
<h2>Script</h2>
<pre><code>// scripts/seed.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, posts } from "../src/lib/server/schema";

const db = drizzle(postgres(process.env.DATABASE_URL!));

const data = await fetch("https://api.mockhero.dev/api/v1/generate", {
  method: "POST",
  headers: { "x-api-key": process.env.MOCKHERO_API_KEY!, "Content-Type": "application/json" },
  body: JSON.stringify({
    tables: [
      { name: "users", count: 25, fields: [
        { name: "id", type: "uuid" },
        { name: "email", type: "email" }
      ]},
      { name: "posts", count: 120, fields: [
        { name: "id", type: "uuid" },
        { name: "author_id", type: "ref", ref: "users.id" },
        { name: "title", type: "sentence" }
      ]}
    ]
  })
}).then(r => r.json());

await db.insert(users).values(data.users);
await db.insert(posts).values(data.posts);</code></pre>

<p>Run with <code>tsx scripts/seed.ts</code>.</p>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Get your free key</a>.</p>
`,
  },
  {
    slug: "nuxt-planetscale-test-data",
    title: "Seed Nuxt + PlanetScale with MockHero",
    description:
      "Quickly seed a Nuxt 3 app backed by PlanetScale MySQL with realistic, relational test data. Includes a Prisma + MockHero seed script.",
    category: "Framework",
    date: "2026-04-09",
    author: "MockHero Team",
    content: `
<h2>The Setup</h2>
<p>Nuxt 3 + Nitro + Prisma + PlanetScale. PlanetScale doesn't support foreign keys in MySQL, but you can still model relations via <code>ref</code> fields in MockHero and enforce them in app code.</p>

<pre><code>// scripts/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const data = await fetch("https://api.mockhero.dev/api/v1/generate", {
  method: "POST",
  headers: { "x-api-key": process.env.MOCKHERO_API_KEY!, "Content-Type": "application/json" },
  body: JSON.stringify({
    tables: [
      { name: "User", count: 40, fields: [
        { name: "id", type: "uuid" },
        { name: "email", type: "email" }
      ]},
      { name: "Event", count: 160, fields: [
        { name: "id", type: "uuid" },
        { name: "userId", type: "ref", ref: "User.id" },
        { name: "name", type: "sentence" }
      ]}
    ]
  })
}).then(r => r.json());

await prisma.user.createMany({ data: data.User });
await prisma.event.createMany({ data: data.Event });</code></pre>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Free API key</a>.</p>
`,
  },
  {
    slug: "remix-prisma-test-data",
    title: "Seed Remix + Prisma with Realistic Test Data",
    description:
      "A clean seed script for Remix apps using Prisma, powered by the MockHero API. Relational data with foreign keys and no manual INSERTs.",
    category: "Framework",
    date: "2026-04-09",
    author: "MockHero Team",
    content: `
<h2>Script</h2>
<pre><code>// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const data = await fetch("https://api.mockhero.dev/api/v1/generate", {
  method: "POST",
  headers: { "x-api-key": process.env.MOCKHERO_API_KEY!, "Content-Type": "application/json" },
  body: JSON.stringify({
    tables: [
      { name: "User", count: 20, fields: [
        { name: "id", type: "uuid" },
        { name: "email", type: "email" }
      ]},
      { name: "Note", count: 100, fields: [
        { name: "id", type: "uuid" },
        { name: "userId", type: "ref", ref: "User.id" },
        { name: "title", type: "sentence" },
        { name: "body", type: "paragraph" }
      ]}
    ]
  })
}).then(r => r.json());

await prisma.user.createMany({ data: data.User });
await prisma.note.createMany({ data: data.Note });</code></pre>

<h2>Wire It Up</h2>
<pre><code>// package.json
{ "prisma": { "seed": "tsx prisma/seed.ts" } }</code></pre>

<p>Then <code>npx prisma db seed</code>.</p>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Grab your free key</a>.</p>
`,
  },
  {
    slug: "astro-turso-test-data",
    title: "Seed Astro + Turso (LibSQL) with MockHero",
    description:
      "Seed a Turso-backed Astro site with realistic relational data using MockHero. Perfect for prototyping content-heavy sites with thousands of rows.",
    category: "Framework",
    date: "2026-04-10",
    author: "MockHero Team",
    content: `
<h2>Script</h2>
<pre><code>// scripts/seed.mjs
import { createClient } from "@libsql/client";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const data = await fetch("https://api.mockhero.dev/api/v1/generate", {
  method: "POST",
  headers: { "x-api-key": process.env.MOCKHERO_API_KEY, "Content-Type": "application/json" },
  body: JSON.stringify({
    format: "sql",
    dialect: "sqlite",
    tables: [
      { name: "authors", count: 15, fields: [
        { name: "id", type: "uuid" },
        { name: "name", type: "full_name" }
      ]},
      { name: "articles", count: 150, fields: [
        { name: "id", type: "uuid" },
        { name: "author_id", type: "ref", ref: "authors.id" },
        { name: "title", type: "sentence" }
      ]}
    ]
  })
}).then(r => r.text());

for (const stmt of data.split(";").filter(Boolean)) {
  await turso.execute(stmt);
}</code></pre>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Create a free account</a>.</p>
`,
  },
  {
    slug: "angular-firebase-test-data",
    title: "Seed an Angular + Firebase App with MockHero",
    description:
      "Generate realistic relational test data for Angular apps backed by Firebase Firestore. Drop-in Node.js seed script included.",
    category: "Framework",
    date: "2026-04-10",
    author: "MockHero Team",
    content: `
<h2>Script</h2>
<pre><code>// scripts/seed.mjs
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp({ credential: cert("./service-account.json") });
const db = getFirestore();

const data = await fetch("https://api.mockhero.dev/api/v1/generate", {
  method: "POST",
  headers: { "x-api-key": process.env.MOCKHERO_API_KEY, "Content-Type": "application/json" },
  body: JSON.stringify({
    tables: [
      { name: "organizations", count: 10, fields: [
        { name: "id", type: "uuid" },
        { name: "name", type: "company_name" }
      ]},
      { name: "members", count: 80, fields: [
        { name: "id", type: "uuid" },
        { name: "orgId", type: "ref", ref: "organizations.id" },
        { name: "email", type: "email" }
      ]}
    ]
  })
}).then(r => r.json());

const batch = db.batch();
for (const o of data.organizations) batch.set(db.collection("orgs").doc(o.id), o);
for (const m of data.members) batch.set(db.collection("members").doc(m.id), m);
await batch.commit();</code></pre>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Get a free API key</a>.</p>
`,
  },
  {
    slug: "express-postgres-test-data",
    title: "Seed an Express + Postgres API with MockHero",
    description:
      "Seed an Express.js REST API backed by Postgres using the MockHero API. Relational data in one call, inserted via node-postgres.",
    category: "Framework",
    date: "2026-04-11",
    author: "MockHero Team",
    content: `
<h2>Script</h2>
<pre><code>// scripts/seed.mjs
import pg from "pg";
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const sql = await fetch("https://api.mockhero.dev/api/v1/generate", {
  method: "POST",
  headers: { "x-api-key": process.env.MOCKHERO_API_KEY, "Content-Type": "application/json" },
  body: JSON.stringify({
    format: "sql",
    dialect: "postgresql",
    tables: [
      { name: "users", count: 100, fields: [
        { name: "id", type: "uuid" },
        { name: "email", type: "email" }
      ]},
      { name: "orders", count: 500, fields: [
        { name: "id", type: "uuid" },
        { name: "user_id", type: "ref", ref: "users.id" },
        { name: "total", type: "price" }
      ]}
    ]
  })
}).then(r => r.text());

await client.query(sql);
await client.end();</code></pre>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Free API key</a>.</p>
`,
  },
  {
    slug: "fastapi-postgres-test-data",
    title: "Seed FastAPI + Postgres with MockHero",
    description:
      "A Python seed script for FastAPI apps backed by Postgres. Generate relational test data via MockHero and insert with SQLAlchemy.",
    category: "Framework",
    date: "2026-04-11",
    author: "MockHero Team",
    content: `
<h2>Script</h2>
<pre><code># scripts/seed.py
import os, requests
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from app.models import User, Post

engine = create_engine(os.environ["DATABASE_URL"])

body = {
  "tables": [
    {"name": "users", "count": 50, "fields": [
      {"name": "id", "type": "uuid"},
      {"name": "email", "type": "email"}
    ]},
    {"name": "posts", "count": 200, "fields": [
      {"name": "id", "type": "uuid"},
      {"name": "user_id", "type": "ref", "ref": "users.id"},
      {"name": "title", "type": "sentence"}
    ]}
  ]
}

data = requests.post(
  "https://api.mockhero.dev/api/v1/generate",
  json=body,
  headers={"x-api-key": os.environ["MOCKHERO_API_KEY"]}
).json()

with Session(engine) as s:
  s.bulk_insert_mappings(User, data["users"])
  s.bulk_insert_mappings(Post, data["posts"])
  s.commit()</code></pre>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Get your free key</a>.</p>
`,
  },
  {
    slug: "django-supabase-test-data",
    title: "Seed Django + Supabase with MockHero",
    description:
      "A Django management command that seeds a Supabase Postgres database using the MockHero API. Relational data, no manual fixtures.",
    category: "Framework",
    date: "2026-04-12",
    author: "MockHero Team",
    content: `
<h2>Command</h2>
<pre><code># app/management/commands/seed.py
import os, requests
from django.core.management.base import BaseCommand
from app.models import Profile, Post

class Command(BaseCommand):
  def handle(self, *args, **kwargs):
    body = {
      "tables": [
        {"name": "profiles", "count": 40, "fields": [
          {"name": "id", "type": "uuid"},
          {"name": "full_name", "type": "full_name"}
        ]},
        {"name": "posts", "count": 200, "fields": [
          {"name": "id", "type": "uuid"},
          {"name": "user_id", "type": "ref", "ref": "profiles.id"},
          {"name": "title", "type": "sentence"}
        ]}
      ]
    }
    data = requests.post(
      "https://api.mockhero.dev/api/v1/generate", json=body,
      headers={"x-api-key": os.environ["MOCKHERO_API_KEY"]}
    ).json()
    Profile.objects.bulk_create([Profile(**p) for p in data["profiles"]])
    Post.objects.bulk_create([Post(**p) for p in data["posts"]])</code></pre>

<p>Run with <code>python manage.py seed</code>.</p>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Free API key</a>.</p>
`,
  },
  {
    slug: "rails-redis-test-data",
    title: "Populate Rails + Redis with Realistic Mock Data",
    description:
      "Use MockHero to populate Redis-backed caches and data stores used by Rails apps. Complete seed task with relational keys and JSON payloads.",
    category: "Framework",
    date: "2026-04-12",
    author: "MockHero Team",
    content: `
<h2>Task</h2>
<pre><code># lib/tasks/seed_redis.rake
require "net/http"
require "json"
require "redis"

namespace :seed do
  task redis: :environment do
    redis = Redis.new(url: ENV["REDIS_URL"])

    body = {
      tables: [
        { name: "users", count: 100, fields: [
          { name: "id", type: "uuid" },
          { name: "name", type: "full_name" },
          { name: "email", type: "email" }
        ]}
      ]
    }

    res = Net::HTTP.post(
      URI("https://api.mockhero.dev/api/v1/generate"),
      body.to_json,
      "Content-Type" => "application/json",
      "x-api-key" => ENV["MOCKHERO_API_KEY"]
    )

    JSON.parse(res.body)["users"].each do |u|
      redis.set("user:#{u["id"]}", u.to_json)
    end
  end
end</code></pre>

<p>Run with <code>bin/rake seed:redis</code>.</p>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Grab a free key</a>.</p>
`,
  },
  {
    slug: "laravel-mysql-test-data",
    title: "Seed Laravel + MySQL with MockHero",
    description:
      "Replace Laravel factories with a single MockHero API call for large relational datasets. Drop-in seeder included.",
    category: "Framework",
    date: "2026-04-13",
    author: "MockHero Team",
    content: `
<h2>Seeder</h2>
<pre><code>// database/seeders/MockHeroSeeder.php
&lt;?php
namespace Database\\Seeders;

use Illuminate\\Database\\Seeder;
use Illuminate\\Support\\Facades\\DB;
use Illuminate\\Support\\Facades\\Http;

class MockHeroSeeder extends Seeder {
  public function run(): void {
    $res = Http::withHeaders(["x-api-key" => env("MOCKHERO_API_KEY")])
      -&gt;post("https://api.mockhero.dev/api/v1/generate", [
        "tables" =&gt; [
          ["name" =&gt; "users", "count" =&gt; 50, "fields" =&gt; [
            ["name" =&gt; "id", "type" =&gt; "uuid"],
            ["name" =&gt; "email", "type" =&gt; "email"],
          ]],
          ["name" =&gt; "orders", "count" =&gt; 200, "fields" =&gt; [
            ["name" =&gt; "id", "type" =&gt; "uuid"],
            ["name" =&gt; "user_id", "type" =&gt; "ref", "ref" =&gt; "users.id"],
            ["name" =&gt; "total", "type" =&gt; "price"],
          ]],
        ],
      ])
      -&gt;json();

    DB::table("users")-&gt;insert($res["users"]);
    DB::table("orders")-&gt;insert($res["orders"]);
  }
}</code></pre>

<p>Run with <code>php artisan db:seed --class=MockHeroSeeder</code>.</p>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Free API key</a>.</p>
`,
  },
  {
    slug: "nestjs-typeorm-postgres-test-data",
    title: "Seed Nest.js + TypeORM + Postgres with MockHero",
    description:
      "A Nest.js seed script that generates relational data via MockHero and inserts it with TypeORM. Production-ready pattern included.",
    category: "Framework",
    date: "2026-04-13",
    author: "MockHero Team",
    content: `
<h2>Script</h2>
<pre><code>// src/scripts/seed.ts
import { DataSource } from "typeorm";
import { User, Product } from "../entities";

const ds = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: [User, Product],
});
await ds.initialize();

const data = await fetch("https://api.mockhero.dev/api/v1/generate", {
  method: "POST",
  headers: { "x-api-key": process.env.MOCKHERO_API_KEY!, "Content-Type": "application/json" },
  body: JSON.stringify({
    tables: [
      { name: "users", count: 30, fields: [
        { name: "id", type: "uuid" },
        { name: "email", type: "email" }
      ]},
      { name: "products", count: 150, fields: [
        { name: "id", type: "uuid" },
        { name: "seller_id", type: "ref", ref: "users.id" },
        { name: "name", type: "product_name" },
        { name: "price", type: "price" }
      ]}
    ]
  })
}).then(r => r.json());

await ds.getRepository(User).insert(data.users);
await ds.getRepository(Product).insert(data.products);</code></pre>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Free API key</a>.</p>
`,
  },
  {
    slug: "nextjs-clerk-user-seeding",
    title: "Seed Next.js + Clerk User Data with MockHero",
    description:
      "Generate realistic user profile data to accompany Clerk-authenticated apps. Create companion profile rows for test Clerk users.",
    category: "Framework",
    date: "2026-04-14",
    author: "MockHero Team",
    content: `
<h2>The Setup</h2>
<p>Clerk handles auth. Your app has a <code>profiles</code> table keyed by Clerk's <code>user_id</code>. After creating test Clerk users programmatically, seed matching profile rows from MockHero.</p>

<pre><code>// scripts/seed-profiles.ts
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";

// 1. Get Clerk user IDs
const { data: users } = await clerkClient.users.getUserList({ limit: 50 });
const clerkIds = users.map(u => u.id);

// 2. Generate matching profile content
const res = await fetch("https://api.mockhero.dev/api/v1/generate", {
  method: "POST",
  headers: { "x-api-key": process.env.MOCKHERO_API_KEY!, "Content-Type": "application/json" },
  body: JSON.stringify({
    tables: [{
      name: "profiles", count: clerkIds.length, fields: [
        { name: "bio", type: "paragraph" },
        { name: "website", type: "url" },
        { name: "location", type: "city" }
      ]
    }]
  })
}).then(r => r.json());

// 3. Pair them
await db.insert(profiles).values(
  res.profiles.map((p: any, i: number) => ({ user_id: clerkIds[i], ...p }))
);</code></pre>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Free API key</a>.</p>
`,
  },
  {
    slug: "react-native-firebase-test-data",
    title: "Seed React Native + Firebase Apps with MockHero",
    description:
      "Populate Firestore with realistic test data for React Native apps so your mobile UI looks production-ready during development.",
    category: "Framework",
    date: "2026-04-14",
    author: "MockHero Team",
    content: `
<h2>The Setup</h2>
<p>React Native app using Firebase JS SDK (or Reanimated + Firestore). A seed script populates Firestore so your Expo build loads with realistic data.</p>

<pre><code>// scripts/seed.mjs
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp({ credential: cert("./service-account.json") });
const db = getFirestore();

const data = await fetch("https://api.mockhero.dev/api/v1/generate", {
  method: "POST",
  headers: { "x-api-key": process.env.MOCKHERO_API_KEY, "Content-Type": "application/json" },
  body: JSON.stringify({
    tables: [
      { name: "users", count: 50, fields: [
        { name: "id", type: "uuid" },
        { name: "name", type: "full_name" },
        { name: "avatar", type: "avatar_url" }
      ]},
      { name: "messages", count: 300, fields: [
        { name: "id", type: "uuid" },
        { name: "from", type: "ref", ref: "users.id" },
        { name: "body", type: "sentence" }
      ]}
    ]
  })
}).then(r => r.json());

const batch = db.batch();
for (const u of data.users) batch.set(db.collection("users").doc(u.id), u);
for (const m of data.messages) batch.set(db.collection("messages").doc(m.id), m);
await batch.commit();</code></pre>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Free key here</a>.</p>
`,
  },
  {
    slug: "flutter-supabase-test-data",
    title: "Seed Flutter + Supabase Apps with MockHero",
    description:
      "A Dart-free seeding approach for Flutter + Supabase: generate data server-side via MockHero and insert with the Supabase service-role key.",
    category: "Framework",
    date: "2026-04-15",
    author: "MockHero Team",
    content: `
<h2>Approach</h2>
<p>Don't seed from the Flutter client — it can't hold a service-role key safely. Run a Node or Python seed script locally or in CI that writes directly to Supabase.</p>

<pre><code>// scripts/seed.mjs
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const data = await fetch("https://api.mockhero.dev/api/v1/generate", {
  method: "POST",
  headers: { "x-api-key": process.env.MOCKHERO_API_KEY, "Content-Type": "application/json" },
  body: JSON.stringify({
    tables: [
      { name: "trips", count: 30, fields: [
        { name: "id", type: "uuid" },
        { name: "destination", type: "city" },
        { name: "start_date", type: "date" },
        { name: "end_date", type: "date" }
      ]}
    ]
  })
}).then(r => r.json());

await supabase.from("trips").insert(data.trips);</code></pre>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Free API key</a>.</p>
`,
  },
  {
    slug: "spring-boot-postgres-test-data",
    title: "Seed Spring Boot + Postgres with MockHero",
    description:
      "Generate realistic relational test data for Spring Boot apps backed by Postgres. Complete Java seeding pattern using MockHero's API.",
    category: "Framework",
    date: "2026-04-15",
    author: "MockHero Team",
    content: `
<h2>Approach</h2>
<p>Use a <code>CommandLineRunner</code> that only runs in a dev profile, pulls data from MockHero, and persists via JPA.</p>

<pre><code>// src/main/java/com/example/seed/DevSeeder.java
@Component
@Profile("dev")
public class DevSeeder implements CommandLineRunner {

  @Autowired UserRepository users;
  @Autowired OrderRepository orders;

  @Override
  public void run(String... args) throws Exception {
    var body = Map.of(
      "tables", List.of(
        Map.of("name","users","count",50,"fields", List.of(
          Map.of("name","id","type","uuid"),
          Map.of("name","email","type","email")
        )),
        Map.of("name","orders","count",200,"fields", List.of(
          Map.of("name","id","type","uuid"),
          Map.of("name","userId","type","ref","ref","users.id"),
          Map.of("name","total","type","price")
        ))
      )
    );

    var client = HttpClient.newHttpClient();
    var req = HttpRequest.newBuilder()
      .uri(URI.create("https://api.mockhero.dev/api/v1/generate"))
      .header("x-api-key", System.getenv("MOCKHERO_API_KEY"))
      .header("Content-Type","application/json")
      .POST(BodyPublishers.ofString(new ObjectMapper().writeValueAsString(body)))
      .build();
    var res = client.send(req, BodyHandlers.ofString());
    // parse + persist
  }
}</code></pre>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Free API key</a>.</p>
`,
  },

  // ============================================================
  // LANGUAGE-SPECIFIC GUIDES
  // ============================================================
  {
    slug: "python-test-data-generation",
    title: "Python Test Data Generation with MockHero",
    description:
      "A clean Python pattern for generating realistic, relational test data via the MockHero API. Works with SQLAlchemy, Django ORM, or plain psycopg.",
    category: "Framework",
    date: "2026-04-16",
    author: "MockHero Team",
    content: `
<h2>The Pattern</h2>
<p>Hit MockHero with <code>requests</code>, receive JSON, and let your ORM do the insert. No Faker.py maintenance, no per-test factories.</p>

<pre><code>import os, requests

def mock(tables, seed=None):
  body = {"tables": tables}
  if seed is not None: body["seed"] = seed
  return requests.post(
    "https://api.mockhero.dev/api/v1/generate",
    json=body,
    headers={"x-api-key": os.environ["MOCKHERO_API_KEY"]}
  ).json()

data = mock([
  {"name": "users", "count": 50, "fields": [
    {"name": "id", "type": "uuid"},
    {"name": "email", "type": "email"},
    {"name": "full_name", "type": "full_name"}
  ]},
  {"name": "orders", "count": 200, "fields": [
    {"name": "id", "type": "uuid"},
    {"name": "user_id", "type": "ref", "ref": "users.id"},
    {"name": "total", "type": "price"}
  ]}
], seed=42)</code></pre>

<h2>Why Not Just Use Faker.py or Mimesis?</h2>
<ul>
<li>Relational data is declarative, not a hand-written loop.</li>
<li>Same <code>seed</code> gives identical data across machines and CI.</li>
<li>Data flows through one endpoint, so a Go service and a Python service can share identical test rows.</li>
</ul>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Grab a free API key</a>.</p>
`,
  },
  {
    slug: "go-test-data-generation",
    title: "Go Test Data Generation with MockHero",
    description:
      "Generate realistic relational test data from Go using MockHero's HTTP API. Type-safe decoding and pgx bulk inserts included.",
    category: "Framework",
    date: "2026-04-16",
    author: "MockHero Team",
    content: `
<h2>The Script</h2>
<pre><code>package main

import (
  "bytes"
  "encoding/json"
  "net/http"
  "os"
)

type Field struct {
  Name string \`json:"name"\`
  Type string \`json:"type"\`
  Ref  string \`json:"ref,omitempty"\`
}
type Table struct {
  Name   string  \`json:"name"\`
  Count  int     \`json:"count"\`
  Fields []Field \`json:"fields"\`
}
type Body struct {
  Tables []Table \`json:"tables"\`
  Seed   int     \`json:"seed,omitempty"\`
}

func main() {
  body := Body{
    Tables: []Table{
      {Name: "users", Count: 30, Fields: []Field{
        {Name: "id", Type: "uuid"},
        {Name: "email", Type: "email"},
      }},
      {Name: "orders", Count: 120, Fields: []Field{
        {Name: "id", Type: "uuid"},
        {Name: "user_id", Type: "ref", Ref: "users.id"},
        {Name: "total", Type: "price"},
      }},
    },
  }
  buf, _ := json.Marshal(body)
  req, _ := http.NewRequest("POST",
    "https://api.mockhero.dev/api/v1/generate", bytes.NewReader(buf))
  req.Header.Set("x-api-key", os.Getenv("MOCKHERO_API_KEY"))
  req.Header.Set("Content-Type", "application/json")
  res, _ := http.DefaultClient.Do(req)
  var data map[string][]map[string]any
  json.NewDecoder(res.Body).Decode(&amp;data)
  // insert with pgx.CopyFrom ...
}</code></pre>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Free API key</a>.</p>
`,
  },
  {
    slug: "ruby-test-data-generation",
    title: "Ruby Test Data Generation with MockHero",
    description:
      "Generate realistic, relational test data from Ruby using the MockHero API. Drop-in pattern for Rails, Sinatra, or plain Ruby scripts.",
    category: "Framework",
    date: "2026-04-17",
    author: "MockHero Team",
    content: `
<h2>Client Helper</h2>
<pre><code>require "net/http"
require "json"

def mockhero(tables, seed: nil)
  body = { tables: tables }
  body[:seed] = seed if seed
  res = Net::HTTP.post(
    URI("https://api.mockhero.dev/api/v1/generate"),
    body.to_json,
    "Content-Type" => "application/json",
    "x-api-key" => ENV["MOCKHERO_API_KEY"]
  )
  JSON.parse(res.body)
end

data = mockhero([
  { name: "users", count: 50, fields: [
    { name: "id", type: "uuid" },
    { name: "email", type: "email" }
  ]},
  { name: "posts", count: 200, fields: [
    { name: "id", type: "uuid" },
    { name: "user_id", type: "ref", ref: "users.id" },
    { name: "title", type: "sentence" }
  ]}
], seed: 42)</code></pre>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Free API key</a>.</p>
`,
  },
  {
    slug: "php-test-data-generation",
    title: "PHP Test Data Generation with MockHero",
    description:
      "Generate realistic relational test data from PHP using Guzzle and the MockHero API. Works great in Laravel and Symfony projects.",
    category: "Framework",
    date: "2026-04-17",
    author: "MockHero Team",
    content: `
<h2>Client</h2>
<pre><code>&lt;?php
use GuzzleHttp\\Client;

$client = new Client();
$res = $client-&gt;post("https://api.mockhero.dev/api/v1/generate", [
  "headers" =&gt; [
    "x-api-key" =&gt; getenv("MOCKHERO_API_KEY"),
    "Content-Type" =&gt; "application/json",
  ],
  "json" =&gt; [
    "tables" =&gt; [
      ["name" =&gt; "users", "count" =&gt; 50, "fields" =&gt; [
        ["name" =&gt; "id", "type" =&gt; "uuid"],
        ["name" =&gt; "email", "type" =&gt; "email"],
      ]],
      ["name" =&gt; "orders", "count" =&gt; 200, "fields" =&gt; [
        ["name" =&gt; "id", "type" =&gt; "uuid"],
        ["name" =&gt; "user_id", "type" =&gt; "ref", "ref" =&gt; "users.id"],
        ["name" =&gt; "total", "type" =&gt; "price"],
      ]],
    ],
  ],
]);

$data = json_decode($res-&gt;getBody(), true);</code></pre>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Free API key</a>.</p>
`,
  },
  {
    slug: "java-test-data-generation",
    title: "Java Test Data Generation with MockHero",
    description:
      "Use MockHero from Java via java.net.http and Jackson to generate relational test data for JDBC, JPA, or Hibernate-backed apps.",
    category: "Framework",
    date: "2026-04-18",
    author: "MockHero Team",
    content: `
<h2>Minimal Client</h2>
<pre><code>import java.net.URI;
import java.net.http.*;
import com.fasterxml.jackson.databind.ObjectMapper;

var body = Map.of("tables", List.of(
  Map.of("name","users","count",50,"fields", List.of(
    Map.of("name","id","type","uuid"),
    Map.of("name","email","type","email")
  )),
  Map.of("name","orders","count",200,"fields", List.of(
    Map.of("name","id","type","uuid"),
    Map.of("name","userId","type","ref","ref","users.id"),
    Map.of("name","total","type","price")
  ))
));

var mapper = new ObjectMapper();
var req = HttpRequest.newBuilder(URI.create("https://api.mockhero.dev/api/v1/generate"))
  .header("x-api-key", System.getenv("MOCKHERO_API_KEY"))
  .header("Content-Type","application/json")
  .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body)))
  .build();

var res = HttpClient.newHttpClient().send(req, HttpResponse.BodyHandlers.ofString());
var data = mapper.readTree(res.body());</code></pre>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Free API key</a>.</p>
`,
  },
  {
    slug: "kotlin-test-data-generation",
    title: "Kotlin Test Data Generation with MockHero",
    description:
      "A concise Kotlin + Ktor client for generating relational test data via the MockHero API. Works in Spring Boot, Ktor, and Android backends.",
    category: "Framework",
    date: "2026-04-18",
    author: "MockHero Team",
    content: `
<h2>Client</h2>
<pre><code>import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.client.request.*

val client = HttpClient(CIO) { install(ContentNegotiation) { json() } }

val body = mapOf(
  "tables" to listOf(
    mapOf("name" to "users", "count" to 50, "fields" to listOf(
      mapOf("name" to "id", "type" to "uuid"),
      mapOf("name" to "email", "type" to "email")
    ))
  )
)

val data: Map&lt;String, List&lt;Map&lt;String, Any&gt;&gt;&gt; = client.post("https://api.mockhero.dev/api/v1/generate") {
  header("x-api-key", System.getenv("MOCKHERO_API_KEY"))
  header("Content-Type", "application/json")
  setBody(body)
}.body()</code></pre>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Free API key</a>.</p>
`,
  },
  {
    slug: "rust-test-data-generation",
    title: "Rust Test Data Generation with MockHero",
    description:
      "Use reqwest and serde to generate realistic test data from Rust via the MockHero API. Great for Actix, Axum, or sqlx-based services.",
    category: "Framework",
    date: "2026-04-19",
    author: "MockHero Team",
    content: `
<h2>Client</h2>
<pre><code>use reqwest::Client;
use serde_json::json;

#[tokio::main]
async fn main() -&gt; Result&lt;(), Box&lt;dyn std::error::Error&gt;&gt; {
  let client = Client::new();
  let body = json!({
    "tables": [
      { "name": "users", "count": 50, "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "email", "type": "email" }
      ]},
      { "name": "orders", "count": 200, "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "user_id", "type": "ref", "ref": "users.id" },
        { "name": "total", "type": "price" }
      ]}
    ]
  });

  let data: serde_json::Value = client
    .post("https://api.mockhero.dev/api/v1/generate")
    .header("x-api-key", std::env::var("MOCKHERO_API_KEY")?)
    .json(&amp;body)
    .send().await?
    .json().await?;

  Ok(())
}</code></pre>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Free API key</a>.</p>
`,
  },
  {
    slug: "csharp-dotnet-test-data-generation",
    title: "C# / .NET Test Data Generation with MockHero",
    description:
      "Generate realistic, relational test data from C# via HttpClient and System.Text.Json. Drops straight into EF Core or Dapper seeders.",
    category: "Framework",
    date: "2026-04-19",
    author: "MockHero Team",
    content: `
<h2>Client</h2>
<pre><code>using System.Net.Http.Json;

var http = new HttpClient();
http.DefaultRequestHeaders.Add("x-api-key", Environment.GetEnvironmentVariable("MOCKHERO_API_KEY"));

var body = new {
  tables = new object[] {
    new {
      name = "Users", count = 50, fields = new object[] {
        new { name = "Id", type = "uuid" },
        new { name = "Email", type = "email" }
      }
    },
    new {
      name = "Orders", count = 200, fields = new object[] {
        new { name = "Id", type = "uuid" },
        new { name = "UserId", type = "ref", @ref = "Users.Id" },
        new { name = "Total", type = "price" }
      }
    }
  }
};

var res = await http.PostAsJsonAsync("https://api.mockhero.dev/api/v1/generate", body);
var data = await res.Content.ReadFromJsonAsync&lt;JsonDocument&gt;();</code></pre>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Free API key</a>.</p>
`,
  },
  {
    slug: "swift-test-data-generation",
    title: "Swift Test Data Generation with MockHero",
    description:
      "Populate Core Data, SQLite, or Firebase with realistic test data from a Swift seeding script that calls the MockHero API.",
    category: "Framework",
    date: "2026-04-20",
    author: "MockHero Team",
    content: `
<h2>Client</h2>
<pre><code>import Foundation

let body: [String: Any] = [
  "tables": [[
    "name": "users",
    "count": 50,
    "fields": [
      ["name": "id", "type": "uuid"],
      ["name": "name", "type": "full_name"]
    ]
  ]]
]

var req = URLRequest(url: URL(string: "https://api.mockhero.dev/api/v1/generate")!)
req.httpMethod = "POST"
req.setValue(ProcessInfo.processInfo.environment["MOCKHERO_API_KEY"], forHTTPHeaderField: "x-api-key")
req.setValue("application/json", forHTTPHeaderField: "Content-Type")
req.httpBody = try JSONSerialization.data(withJSONObject: body)

let (data, _) = try await URLSession.shared.data(for: req)
let json = try JSONSerialization.jsonObject(with: data) as! [String: Any]</code></pre>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Free API key</a>.</p>
`,
  },
  {
    slug: "elixir-test-data-generation",
    title: "Elixir Test Data Generation with MockHero",
    description:
      "Generate realistic, relational test data from Elixir using Req (or HTTPoison). Perfect for Phoenix + Ecto seed scripts.",
    category: "Framework",
    date: "2026-04-20",
    author: "MockHero Team",
    content: `
<h2>Client</h2>
<pre><code>defmodule MockHero do
  def generate(tables, seed \\\\ nil) do
    body = %{tables: tables}
    body = if seed, do: Map.put(body, :seed, seed), else: body

    Req.post!("https://api.mockhero.dev/api/v1/generate",
      json: body,
      headers: [
        {"x-api-key", System.get_env("MOCKHERO_API_KEY")}
      ]
    ).body
  end
end

data = MockHero.generate([
  %{name: "users", count: 50, fields: [
    %{name: "id", type: "uuid"},
    %{name: "email", type: "email"}
  ]},
  %{name: "posts", count: 200, fields: [
    %{name: "id", type: "uuid"},
    %{name: "user_id", type: "ref", ref: "users.id"},
    %{name: "title", type: "sentence"}
  ]}
], 42)</code></pre>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Free API key</a>.</p>
`,
  },

  // ============================================================
  // TESTING FRAMEWORKS
  // ============================================================
  {
    slug: "jest-mock-data-with-mockhero",
    title: "Using MockHero with Jest for Deterministic Test Fixtures",
    description:
      "Generate deterministic test fixtures for Jest using the MockHero API. Fetch once, cache as JSON, and re-use across test runs.",
    category: "Use Case",
    date: "2026-04-21",
    author: "MockHero Team",
    content: `
<h2>The Pattern</h2>
<p>Generate test data once with a deterministic <code>seed</code>, save to <code>__fixtures__/</code>, and import from your Jest tests. No network calls on each run, but still realistic data.</p>

<pre><code>// scripts/gen-fixtures.ts
import fs from "node:fs";

const data = await fetch("https://api.mockhero.dev/api/v1/generate", {
  method: "POST",
  headers: { "x-api-key": process.env.MOCKHERO_API_KEY!, "Content-Type": "application/json" },
  body: JSON.stringify({
    seed: 1,
    tables: [{
      name: "users", count: 20, fields: [
        { name: "id", type: "uuid" },
        { name: "email", type: "email" }
      ]
    }]
  })
}).then(r => r.json());

fs.writeFileSync("__fixtures__/users.json", JSON.stringify(data.users, null, 2));</code></pre>

<pre><code>// users.test.ts
import users from "../__fixtures__/users.json";

test("handles 20 users", () =&gt; {
  expect(users).toHaveLength(20);
});</code></pre>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Free API key</a>.</p>
`,
  },
  {
    slug: "vitest-mockhero-fixtures",
    title: "Vitest Fixtures with MockHero: Fast, Realistic, Deterministic",
    description:
      "Use MockHero to generate realistic, relational test fixtures for Vitest. Regenerate with a seed; import with zero network overhead during tests.",
    category: "Use Case",
    date: "2026-04-21",
    author: "MockHero Team",
    content: `
<h2>Generate Once, Import Everywhere</h2>
<pre><code>// scripts/fixtures.ts
import fs from "node:fs/promises";

const data = await fetch("https://api.mockhero.dev/api/v1/generate", {
  method: "POST",
  headers: { "x-api-key": process.env.MOCKHERO_API_KEY!, "Content-Type": "application/json" },
  body: JSON.stringify({
    seed: 7,
    tables: [
      { name: "products", count: 50, fields: [
        { name: "id", type: "uuid" },
        { name: "name", type: "product_name" },
        { name: "price", type: "price" }
      ]}
    ]
  })
}).then(r => r.json());

await fs.writeFile("src/__fixtures__/products.json", JSON.stringify(data.products));</code></pre>

<pre><code>// src/products.test.ts
import { test, expect } from "vitest";
import products from "./__fixtures__/products.json";

test("catalog has 50 products", () =&gt; {
  expect(products).toHaveLength(50);
});</code></pre>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Free API key</a>.</p>
`,
  },
  {
    slug: "playwright-test-data-with-mockhero",
    title: "Playwright E2E Tests with Realistic Data from MockHero",
    description:
      "Seed your app before Playwright runs so end-to-end tests render like production. Global setup hook and seed script included.",
    category: "Use Case",
    date: "2026-04-22",
    author: "MockHero Team",
    content: `
<h2>Global Setup</h2>
<pre><code>// playwright.config.ts
export default defineConfig({
  globalSetup: "./tests/global-setup.ts",
  // ...
});</code></pre>

<pre><code>// tests/global-setup.ts
import { createClient } from "@supabase/supabase-js";

export default async () =&gt; {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const data = await fetch("https://api.mockhero.dev/api/v1/generate", {
    method: "POST",
    headers: { "x-api-key": process.env.MOCKHERO_API_KEY!, "Content-Type": "application/json" },
    body: JSON.stringify({
      seed: 1,
      tables: [
        { name: "users", count: 10, fields: [
          { name: "id", type: "uuid" },
          { name: "email", type: "email" }
        ]}
      ]
    })
  }).then(r =&gt; r.json());

  await supabase.from("users").upsert(data.users);
};</code></pre>

<p>Now every Playwright test starts against a realistic 10-user dataset.</p>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Free API key</a>.</p>
`,
  },
  {
    slug: "cypress-mock-data-with-mockhero",
    title: "Seed Cypress E2E Tests with MockHero",
    description:
      "Run Cypress against a realistic, relationally consistent dataset using MockHero. Seed before the suite via cy.task, then run tests offline.",
    category: "Use Case",
    date: "2026-04-22",
    author: "MockHero Team",
    content: `
<h2>cypress.config.ts</h2>
<pre><code>import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    async setupNodeEvents(on, config) {
      on("task", {
        async seed() {
          const data = await fetch("https://api.mockhero.dev/api/v1/generate", {
            method: "POST",
            headers: {
              "x-api-key": process.env.MOCKHERO_API_KEY!,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              seed: 1,
              tables: [{
                name: "users", count: 10,
                fields: [
                  { name: "id", type: "uuid" },
                  { name: "email", type: "email" }
                ]
              }]
            })
          }).then(r =&gt; r.json());
          // insert into your DB here
          return null;
        }
      });
    }
  }
});</code></pre>

<pre><code>// cypress/e2e/home.cy.ts
before(() =&gt; { cy.task("seed"); });

it("renders 10 users", () =&gt; {
  cy.visit("/users");
  cy.get("[data-testid=user-row]").should("have.length", 10);
});</code></pre>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Free API key</a>.</p>
`,
  },
  {
    slug: "pytest-fixtures-with-mockhero",
    title: "Pytest Fixtures Powered by MockHero",
    description:
      "Define session-scoped Pytest fixtures that pull realistic relational data from MockHero. Deterministic seeds keep tests reproducible.",
    category: "Use Case",
    date: "2026-04-23",
    author: "MockHero Team",
    content: `
<h2>conftest.py</h2>
<pre><code>import os, requests, pytest

@pytest.fixture(scope="session")
def dataset():
    return requests.post(
        "https://api.mockhero.dev/api/v1/generate",
        json={
            "seed": 42,
            "tables": [
                {"name": "users", "count": 20, "fields": [
                    {"name": "id", "type": "uuid"},
                    {"name": "email", "type": "email"}
                ]},
                {"name": "orders", "count": 80, "fields": [
                    {"name": "id", "type": "uuid"},
                    {"name": "user_id", "type": "ref", "ref": "users.id"},
                    {"name": "total", "type": "price"}
                ]}
            ]
        },
        headers={"x-api-key": os.environ["MOCKHERO_API_KEY"]}
    ).json()

def test_has_twenty_users(dataset):
    assert len(dataset["users"]) == 20</code></pre>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Free API key</a>.</p>
`,
  },
  {
    slug: "rspec-fixtures-with-mockhero",
    title: "RSpec Fixtures with MockHero",
    description:
      "Replace hand-built factories with realistic, relational data from MockHero in your RSpec suite. Great for integration tests against Postgres.",
    category: "Use Case",
    date: "2026-04-23",
    author: "MockHero Team",
    content: `
<h2>spec_helper.rb</h2>
<pre><code>require "net/http"
require "json"

RSpec.configure do |config|
  config.before(:suite) do
    body = {
      seed: 1,
      tables: [
        { name: "users", count: 20, fields: [
          { name: "id", type: "uuid" },
          { name: "email", type: "email" }
        ]},
        { name: "orders", count: 80, fields: [
          { name: "id", type: "uuid" },
          { name: "user_id", type: "ref", ref: "users.id" },
          { name: "total", type: "price" }
        ]}
      ]
    }
    res = Net::HTTP.post(
      URI("https://api.mockhero.dev/api/v1/generate"),
      body.to_json,
      "Content-Type" => "application/json",
      "x-api-key" => ENV["MOCKHERO_API_KEY"]
    )
    data = JSON.parse(res.body)
    User.insert_all(data["users"])
    Order.insert_all(data["orders"])
  end
end</code></pre>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Free API key</a>.</p>
`,
  },
  {
    slug: "phpunit-fixtures-with-mockhero",
    title: "PHPUnit Fixtures with MockHero",
    description:
      "Generate realistic, relational test data for PHPUnit integration tests using the MockHero API. Works great with Laravel and Symfony.",
    category: "Use Case",
    date: "2026-04-24",
    author: "MockHero Team",
    content: `
<h2>Base Test Case</h2>
<pre><code>&lt;?php
use PHPUnit\\Framework\\TestCase;
use GuzzleHttp\\Client;

abstract class IntegrationTestCase extends TestCase {
  protected static array $data;

  public static function setUpBeforeClass(): void {
    $client = new Client();
    $res = $client-&gt;post("https://api.mockhero.dev/api/v1/generate", [
      "headers" =&gt; [
        "x-api-key" =&gt; getenv("MOCKHERO_API_KEY"),
      ],
      "json" =&gt; [
        "seed" =&gt; 1,
        "tables" =&gt; [[
          "name" =&gt; "users", "count" =&gt; 10, "fields" =&gt; [
            ["name" =&gt; "id", "type" =&gt; "uuid"],
            ["name" =&gt; "email", "type" =&gt; "email"],
          ]
        ]]
      ]
    ]);
    self::$data = json_decode($res-&gt;getBody(), true);
  }
}</code></pre>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Free API key</a>.</p>
`,
  },
  {
    slug: "junit-fixtures-with-mockhero",
    title: "JUnit Integration Tests with MockHero",
    description:
      "Seed your Spring Boot integration tests with realistic, relational data from MockHero. Run JUnit against a populated Postgres for confidence.",
    category: "Use Case",
    date: "2026-04-24",
    author: "MockHero Team",
    content: `
<h2>@BeforeAll Fixture</h2>
<pre><code>@SpringBootTest
class OrderServiceIT {

  @Autowired JdbcTemplate jdbc;

  @BeforeAll
  static void seed(@Autowired JdbcTemplate jdbc) throws Exception {
    var body = Map.of(
      "seed", 1,
      "tables", List.of(
        Map.of("name","users","count",20,"fields", List.of(
          Map.of("name","id","type","uuid"),
          Map.of("name","email","type","email")
        )),
        Map.of("name","orders","count",80,"fields", List.of(
          Map.of("name","id","type","uuid"),
          Map.of("name","user_id","type","ref","ref","users.id"),
          Map.of("name","total","type","price")
        ))
      )
    );
    var mapper = new ObjectMapper();
    var client = HttpClient.newHttpClient();
    var req = HttpRequest.newBuilder(URI.create("https://api.mockhero.dev/api/v1/generate"))
      .header("x-api-key", System.getenv("MOCKHERO_API_KEY"))
      .header("Content-Type","application/json")
      .POST(BodyPublishers.ofString(mapper.writeValueAsString(body)))
      .build();
    var res = client.send(req, BodyHandlers.ofString());
    // parse &amp; insert via jdbc.batchUpdate(...)
  }
}</code></pre>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Free API key</a>.</p>
`,
  },
  {
    slug: "mocha-chai-fixtures-with-mockhero",
    title: "Mocha + Chai Fixtures with MockHero",
    description:
      "Use MockHero to produce deterministic relational fixtures for Mocha + Chai. Generate once per suite, reuse across every spec.",
    category: "Use Case",
    date: "2026-04-25",
    author: "MockHero Team",
    content: `
<h2>Fixture Loader</h2>
<pre><code>// test/fixtures.mjs
export async function loadFixtures() {
  return fetch("https://api.mockhero.dev/api/v1/generate", {
    method: "POST",
    headers: {
      "x-api-key": process.env.MOCKHERO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      seed: 3,
      tables: [{
        name: "books", count: 30, fields: [
          { name: "id", type: "uuid" },
          { name: "title", type: "book_title" },
          { name: "author", type: "full_name" }
        ]
      }]
    })
  }).then(r =&gt; r.json());
}</code></pre>

<pre><code>// test/books.test.mjs
import { expect } from "chai";
import { loadFixtures } from "./fixtures.mjs";

let data;
before(async () =&gt; { data = await loadFixtures(); });

it("returns 30 books", () =&gt; {
  expect(data.books).to.have.length(30);
});</code></pre>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Free API key</a>.</p>
`,
  },
  {
    slug: "selenium-e2e-with-mockhero-seeds",
    title: "Selenium E2E Tests with MockHero Seeded Data",
    description:
      "Seed your app before Selenium runs so your browser tests render realistic data. Works with any language binding.",
    category: "Use Case",
    date: "2026-04-25",
    author: "MockHero Team",
    content: `
<h2>Pattern</h2>
<p>Selenium doesn't care how the data got there — just make sure it's seeded before the browser hits the page. Use your CI's <em>Before Suite</em> step to call MockHero and populate your DB.</p>

<pre><code># .github/workflows/e2e.yml
- name: Seed test data
  run: node scripts/seed.mjs
  env:
    MOCKHERO_API_KEY: \${{ secrets.MOCKHERO_API_KEY }}
    DATABASE_URL: \${{ secrets.TEST_DATABASE_URL }}

- name: Selenium tests
  run: pytest tests/selenium</code></pre>

<pre><code>// scripts/seed.mjs
const data = await fetch("https://api.mockhero.dev/api/v1/generate", {
  method: "POST",
  headers: { "x-api-key": process.env.MOCKHERO_API_KEY, "Content-Type": "application/json" },
  body: JSON.stringify({
    seed: 1,
    tables: [
      { name: "users", count: 10, fields: [
        { name: "id", type: "uuid" },
        { name: "email", type: "email" }
      ]}
    ]
  })
}).then(r =&gt; r.json());
// insert into test DB ...</code></pre>

<h2>Get Started</h2>
<p><a href="https://mockhero.dev/sign-up">Free API key</a>.</p>
`,
  },
];
