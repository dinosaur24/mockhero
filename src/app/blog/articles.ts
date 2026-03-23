export type ArticleCategory = "Database" | "Framework" | "Use Case";

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
];
