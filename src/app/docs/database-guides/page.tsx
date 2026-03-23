import { Separator } from "@/components/ui/separator"

export const metadata = {
  title: "Database Guides | MockHero",
  description:
    "How to insert MockHero-generated data into Supabase, Neon, Prisma, Drizzle, Firebase, MongoDB, and raw SQL.",
}

export default function DatabaseGuidesPage() {
  return (
    <div className="space-y-8 sm:space-y-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Database Guides
        </h1>
        <p className="mt-3 text-base sm:text-lg text-muted-foreground">
          MockHero generates data. These guides show you how to insert it into
          every popular database and ORM. The API call is the same every time
          &mdash; only the insert logic changes.
        </p>
      </div>

      <Separator />

      {/* Shared API call */}
      <section>
        <h2 id="shared-api-call" className="text-xl sm:text-2xl font-bold">
          The MockHero API Call (same for all guides)
        </h2>
        <p className="mt-2 text-muted-foreground">
          Every guide below starts with the same generate request. The only
          thing that changes is the{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm">
            format
          </code>{" "}
          parameter: use{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm">
            &quot;json&quot;
          </code>{" "}
          for ORMs and drivers, or{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm">
            &quot;sql&quot;
          </code>{" "}
          for raw SQL.
        </p>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`const response = await fetch("https://mockhero.dev/api/v1/generate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer mh_YOUR_API_KEY",
  },
  body: JSON.stringify({
    template: "ecommerce", // or "blog", "saas", "social"
    scale: 1,
    format: "json", // use "sql" for raw SQL guides
  }),
});

const { data } = await response.json();
// data.customers, data.products, data.orders, etc.`}
        </pre>
      </section>

      <Separator />

      {/* ---------------------------------------------------------------- */}
      {/* 1. Supabase */}
      {/* ---------------------------------------------------------------- */}
      <section>
        <h2 id="supabase" className="text-xl sm:text-2xl font-bold">
          1. Supabase (JavaScript)
        </h2>
        <p className="mt-2 text-muted-foreground">
          Supabase wraps PostgreSQL with a REST layer and Row Level Security
          (RLS). The fastest path to seeding is the{" "}
          <strong>service role key</strong>, which bypasses RLS entirely.
        </p>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">
          Prerequisites
        </h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`npm install @supabase/supabase-js`}
        </pre>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">
          Complete Seed Script
        </h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`// scripts/seed.ts
// Run: npx tsx scripts/seed.ts

import { createClient } from "@supabase/supabase-js";

const MOCKHERO_API_KEY = process.env.MOCKHERO_API_KEY!;
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use the service role key — it bypasses RLS
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log("Generating mock data...");
  const res = await fetch("https://mockhero.dev/api/v1/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: \`Bearer \${MOCKHERO_API_KEY}\`,
    },
    body: JSON.stringify({
      template: "ecommerce",
      scale: 1,
      format: "json",
    }),
  });

  if (!res.ok) throw new Error(\`MockHero API error: \${res.status}\`);
  const { data } = await res.json();

  // Insert in dependency order (parents before children)
  const tables = ["customers", "products", "orders", "order_items", "reviews"];

  for (const table of tables) {
    const rows = data[table];
    if (!rows || rows.length === 0) continue;

    // Supabase has a 1000-row limit per insert — batch if needed
    const BATCH_SIZE = 500;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from(table).insert(batch);
      if (error) {
        console.error(\`Error inserting into \${table}:\`, error.message);
        process.exit(1);
      }
    }
    console.log(\`  Inserted \${rows.length} rows into \${table}\`);
  }

  console.log("Done!");
}

main();`}
        </pre>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">
          RLS Gotcha
        </h3>
        <p className="mt-2 text-muted-foreground">
          If you use the{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm">
            anon
          </code>{" "}
          key instead of the service role key, inserts will silently fail (or
          return an empty array) because RLS blocks all writes by default. To
          fix this, either use the service role key for seeding, or add explicit
          insert policies:
        </p>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`-- Allow the anon role to read (add this if your app reads with anon key)
CREATE POLICY "Allow public read" ON customers
  FOR SELECT USING (true);

-- For seeding specifically, prefer the service role key instead
-- of opening up insert policies to anon.`}
        </pre>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">
          Common Gotchas
        </h3>
        <ul className="mt-2 list-disc pl-6 text-muted-foreground space-y-1">
          <li>
            <strong>RLS:</strong> Service role key bypasses RLS. Anon key does
            not. Always seed with service role.
          </li>
          <li>
            <strong>Batch size:</strong> Supabase limits inserts to ~1000 rows.
            Batch your inserts.
          </li>
          <li>
            <strong>FK ordering:</strong> Insert parent tables first (customers,
            products) before children (orders, order_items).
          </li>
        </ul>
      </section>

      <Separator />

      {/* ---------------------------------------------------------------- */}
      {/* 2. Neon */}
      {/* ---------------------------------------------------------------- */}
      <section>
        <h2 id="neon" className="text-xl sm:text-2xl font-bold">
          2. Neon (PostgreSQL via @neondatabase/serverless)
        </h2>
        <p className="mt-2 text-muted-foreground">
          Neon is serverless PostgreSQL. You can use their driver for direct SQL
          inserts, or use MockHero&apos;s{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm">
            format: &quot;sql&quot;
          </code>{" "}
          output to get raw INSERT statements you can execute directly.
        </p>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">
          Prerequisites
        </h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`npm install @neondatabase/serverless`}
        </pre>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">
          Option A: JSON Format with Parameterized Inserts
        </h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`// scripts/seed.ts
// Run: npx tsx scripts/seed.ts

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);
const MOCKHERO_API_KEY = process.env.MOCKHERO_API_KEY!;

async function main() {
  console.log("Generating mock data...");
  const res = await fetch("https://mockhero.dev/api/v1/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: \`Bearer \${MOCKHERO_API_KEY}\`,
    },
    body: JSON.stringify({
      template: "ecommerce",
      scale: 1,
      format: "json",
    }),
  });

  if (!res.ok) throw new Error(\`MockHero API error: \${res.status}\`);
  const { data } = await res.json();

  // Insert in dependency order
  const tables = ["customers", "products", "orders", "order_items", "reviews"];

  for (const table of tables) {
    const rows = data[table];
    if (!rows || rows.length === 0) continue;

    const columns = Object.keys(rows[0]);
    const colList = columns.map((c) => \`"\${c}"\`).join(", ");

    for (const row of rows) {
      const values = columns.map((c) => row[c]);
      const placeholders = columns.map((_, i) => \`$\${i + 1}\`).join(", ");
      await sql(\`INSERT INTO \${table} (\${colList}) VALUES (\${placeholders})\`, values);
    }

    console.log(\`  Inserted \${rows.length} rows into \${table}\`);
  }

  console.log("Done!");
}

main();`}
        </pre>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">
          Option B: SQL Format (raw INSERT statements)
        </h3>
        <p className="mt-2 text-muted-foreground">
          Use MockHero&apos;s SQL output to get ready-to-execute INSERT
          statements. This is the fastest approach &mdash; no mapping needed.
        </p>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`// scripts/seed-sql.ts
// Run: npx tsx scripts/seed-sql.ts

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);
const MOCKHERO_API_KEY = process.env.MOCKHERO_API_KEY!;

async function main() {
  console.log("Generating SQL...");
  const res = await fetch("https://mockhero.dev/api/v1/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: \`Bearer \${MOCKHERO_API_KEY}\`,
    },
    body: JSON.stringify({
      template: "ecommerce",
      scale: 1,
      format: "sql",
      sql_dialect: "postgres",
    }),
  });

  if (!res.ok) throw new Error(\`MockHero API error: \${res.status}\`);
  const { data } = await res.json();

  // data.sql is a string of INSERT statements
  // Split on semicolons and execute each statement
  const statements = data.sql
    .split(";")
    .map((s: string) => s.trim())
    .filter(Boolean);

  for (const stmt of statements) {
    await sql(stmt);
  }

  console.log(\`Executed \${statements.length} INSERT statements\`);
  console.log("Done!");
}

main();`}
        </pre>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">
          Common Gotchas
        </h3>
        <ul className="mt-2 list-disc pl-6 text-muted-foreground space-y-1">
          <li>
            <strong>Connection pooling:</strong> The{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm">
              neon()
            </code>{" "}
            driver uses HTTP, which is stateless. For large seeds, consider
            using{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm">
              Pool
            </code>{" "}
            from{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm">
              @neondatabase/serverless
            </code>{" "}
            for WebSocket connections.
          </li>
          <li>
            <strong>FK ordering:</strong> Always insert parent tables before
            children.
          </li>
          <li>
            <strong>SQL format:</strong> The{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm">
              sql_dialect: &quot;postgres&quot;
            </code>{" "}
            option ensures correct quoting and types for Neon/PostgreSQL.
          </li>
        </ul>
      </section>

      <Separator />

      {/* ---------------------------------------------------------------- */}
      {/* 3. Prisma */}
      {/* ---------------------------------------------------------------- */}
      <section>
        <h2 id="prisma" className="text-xl sm:text-2xl font-bold">
          3. Prisma
        </h2>
        <p className="mt-2 text-muted-foreground">
          Prisma&apos;s{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm">
            createMany
          </code>{" "}
          maps directly to MockHero&apos;s JSON output. The field names in the
          response match typical Prisma schemas, so you can pass the data
          straight through.
        </p>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">
          Prerequisites
        </h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`npm install @prisma/client
npx prisma generate`}
        </pre>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">
          Complete Seed Script
        </h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`// scripts/seed.ts
// Run: npx tsx scripts/seed.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const MOCKHERO_API_KEY = process.env.MOCKHERO_API_KEY!;

async function main() {
  console.log("Generating mock data...");
  const res = await fetch("https://mockhero.dev/api/v1/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: \`Bearer \${MOCKHERO_API_KEY}\`,
    },
    body: JSON.stringify({
      template: "ecommerce",
      scale: 1,
      format: "json",
    }),
  });

  if (!res.ok) throw new Error(\`MockHero API error: \${res.status}\`);
  const { data } = await res.json();

  // Insert in dependency order to satisfy foreign keys
  console.log("Seeding customers...");
  await prisma.customer.createMany({ data: data.customers });

  console.log("Seeding products...");
  await prisma.product.createMany({ data: data.products });

  console.log("Seeding orders...");
  await prisma.order.createMany({
    data: data.orders.map((o: Record<string, unknown>) => ({
      ...o,
      // Map snake_case to your Prisma model field names if needed
      customerId: o.customer_id,
      orderNumber: o.order_number,
      orderedAt: o.ordered_at,
      paymentMethod: o.payment_method,
    })),
  });

  console.log("Seeding order items...");
  await prisma.orderItem.createMany({
    data: data.order_items.map((i: Record<string, unknown>) => ({
      ...i,
      orderId: i.order_id,
      productId: i.product_id,
      unitPrice: i.unit_price,
    })),
  });

  console.log("Seeding reviews...");
  await prisma.review.createMany({
    data: data.reviews.map((r: Record<string, unknown>) => ({
      ...r,
      customerId: r.customer_id,
      productId: r.product_id,
    })),
  });

  console.log("Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());`}
        </pre>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">
          If Your Schema Uses snake_case
        </h3>
        <p className="mt-2 text-muted-foreground">
          If your Prisma schema already uses snake_case column names (via{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm">
            @map
          </code>{" "}
          or matching names), you can skip the field mapping and insert
          directly:
        </p>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`// If your Prisma schema uses snake_case, insert directly:
await prisma.order.createMany({ data: data.orders });`}
        </pre>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">
          Common Gotchas
        </h3>
        <ul className="mt-2 list-disc pl-6 text-muted-foreground space-y-1">
          <li>
            <strong>FK ordering:</strong> Insert parent tables (customers,
            products) before children (orders, order_items, reviews).
          </li>
          <li>
            <strong>Field name mapping:</strong> MockHero outputs snake_case
            (e.g.{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm">
              customer_id
            </code>
            ). If your Prisma model uses camelCase, map the fields.
          </li>
          <li>
            <strong>createMany limits:</strong> Some databases (e.g. SQLite
            via Prisma) don&apos;t support{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm">
              createMany
            </code>
            . Use individual{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm">
              create
            </code>{" "}
            calls in a loop instead.
          </li>
          <li>
            <strong>Transactions:</strong> Wrap everything in{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm">
              prisma.$transaction()
            </code>{" "}
            if you want all-or-nothing inserts.
          </li>
        </ul>
      </section>

      <Separator />

      {/* ---------------------------------------------------------------- */}
      {/* 4. Drizzle ORM */}
      {/* ---------------------------------------------------------------- */}
      <section>
        <h2 id="drizzle" className="text-xl sm:text-2xl font-bold">
          4. Drizzle ORM
        </h2>
        <p className="mt-2 text-muted-foreground">
          Drizzle&apos;s{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm">
            .insert().values()
          </code>{" "}
          accepts arrays of objects, which maps perfectly to MockHero&apos;s
          JSON output.
        </p>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">
          Prerequisites
        </h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`npm install drizzle-orm postgres
# or with Neon:
npm install drizzle-orm @neondatabase/serverless`}
        </pre>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">
          Complete Seed Script
        </h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`// scripts/seed.ts
// Run: npx tsx scripts/seed.ts

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  customers,
  products,
  orders,
  orderItems,
  reviews,
} from "../src/db/schema"; // your Drizzle schema

const connection = postgres(process.env.DATABASE_URL!);
const db = drizzle(connection);
const MOCKHERO_API_KEY = process.env.MOCKHERO_API_KEY!;

async function main() {
  console.log("Generating mock data...");
  const res = await fetch("https://mockhero.dev/api/v1/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: \`Bearer \${MOCKHERO_API_KEY}\`,
    },
    body: JSON.stringify({
      template: "ecommerce",
      scale: 1,
      format: "json",
    }),
  });

  if (!res.ok) throw new Error(\`MockHero API error: \${res.status}\`);
  const { data } = await res.json();

  // Insert in dependency order
  console.log("Seeding customers...");
  await db.insert(customers).values(data.customers);

  console.log("Seeding products...");
  await db.insert(products).values(data.products);

  console.log("Seeding orders...");
  await db.insert(orders).values(data.orders);

  console.log("Seeding order items...");
  await db.insert(orderItems).values(data.order_items);

  console.log("Seeding reviews...");
  await db.insert(reviews).values(data.reviews);

  console.log("Done!");
  await connection.end();
}

main();`}
        </pre>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">
          With Neon Serverless Driver
        </h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`// Replace the connection setup with:
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// The rest of the seed script is identical`}
        </pre>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">
          Common Gotchas
        </h3>
        <ul className="mt-2 list-disc pl-6 text-muted-foreground space-y-1">
          <li>
            <strong>Column name mapping:</strong> If your Drizzle schema uses
            camelCase in TypeScript but snake_case in the database, Drizzle
            handles the mapping. MockHero outputs snake_case to match the
            database columns.
          </li>
          <li>
            <strong>Batch size:</strong> For large datasets, PostgreSQL has a
            limit on the number of parameters per query (~65535). Split large
            arrays into batches of 500-1000 rows.
          </li>
          <li>
            <strong>FK ordering:</strong> Always insert parent tables first.
          </li>
        </ul>
      </section>

      <Separator />

      {/* ---------------------------------------------------------------- */}
      {/* 5. Firebase Firestore */}
      {/* ---------------------------------------------------------------- */}
      <section>
        <h2 id="firebase" className="text-xl sm:text-2xl font-bold">
          5. Firebase Firestore
        </h2>
        <p className="mt-2 text-muted-foreground">
          Firestore is a NoSQL document database. There are no foreign key
          constraints, but MockHero&apos;s reference IDs are still useful for
          app-level joins. Use batch writes for performance.
        </p>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">
          Prerequisites
        </h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`npm install firebase-admin`}
        </pre>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">
          Complete Seed Script
        </h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`// scripts/seed.ts
// Run: npx tsx scripts/seed.ts

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize with service account
initializeApp({
  credential: cert(require("../service-account.json")),
});

const db = getFirestore();
const MOCKHERO_API_KEY = process.env.MOCKHERO_API_KEY!;

async function main() {
  console.log("Generating mock data...");
  const res = await fetch("https://mockhero.dev/api/v1/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: \`Bearer \${MOCKHERO_API_KEY}\`,
    },
    body: JSON.stringify({
      template: "ecommerce",
      scale: 1,
      format: "json",
    }),
  });

  if (!res.ok) throw new Error(\`MockHero API error: \${res.status}\`);
  const { data } = await res.json();

  const collections = ["customers", "products", "orders", "order_items", "reviews"];

  for (const collection of collections) {
    const rows = data[collection];
    if (!rows || rows.length === 0) continue;

    // Firestore batch writes are limited to 500 operations
    const BATCH_SIZE = 500;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const chunk = rows.slice(i, i + BATCH_SIZE);

      for (const row of chunk) {
        // Use MockHero's id as the document ID
        const docRef = db.collection(collection).doc(row.id);
        batch.set(docRef, row);
      }

      await batch.commit();
    }

    console.log(\`  Inserted \${rows.length} docs into \${collection}\`);
  }

  console.log("Done!");
}

main();`}
        </pre>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">
          Nesting vs. Flattening
        </h3>
        <p className="mt-2 text-muted-foreground">
          MockHero returns flat relational data with reference IDs (e.g.{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm">
            customer_id
          </code>
          ). For Firestore, you can either:
        </p>
        <ul className="mt-2 list-disc pl-6 text-muted-foreground space-y-1">
          <li>
            <strong>Keep it flat</strong> (recommended) &mdash; store
            reference IDs as strings and query with{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm">
              where(&quot;customer_id&quot;, &quot;==&quot;, id)
            </code>
          </li>
          <li>
            <strong>Nest as subcollections</strong> &mdash; store order_items
            under{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm">
              orders/{`{orderId}`}/items
            </code>
          </li>
        </ul>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">
          Common Gotchas
        </h3>
        <ul className="mt-2 list-disc pl-6 text-muted-foreground space-y-1">
          <li>
            <strong>Batch limit:</strong> Firestore batch writes are limited to
            500 operations. Split large datasets.
          </li>
          <li>
            <strong>No FK enforcement:</strong> Firestore won&apos;t reject
            invalid references. MockHero ensures all refs are valid, but be
            careful if you modify the data.
          </li>
          <li>
            <strong>Document size:</strong> Each Firestore document has a 1 MB
            limit. MockHero rows are well under this.
          </li>
        </ul>
      </section>

      <Separator />

      {/* ---------------------------------------------------------------- */}
      {/* 6. Raw SQL */}
      {/* ---------------------------------------------------------------- */}
      <section>
        <h2 id="raw-sql" className="text-xl sm:text-2xl font-bold">
          6. Raw SQL (Any Database)
        </h2>
        <p className="mt-2 text-muted-foreground">
          The universal approach. Use MockHero&apos;s{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm">
            format: &quot;sql&quot;
          </code>{" "}
          with your target dialect and pipe the output directly into your
          database CLI.
        </p>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">
          Supported Dialects
        </h3>
        <ul className="mt-2 list-disc pl-6 text-muted-foreground space-y-1">
          <li>
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm">
              sql_dialect: &quot;postgres&quot;
            </code>{" "}
            &mdash; PostgreSQL, Neon, Supabase, CockroachDB
          </li>
          <li>
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm">
              sql_dialect: &quot;mysql&quot;
            </code>{" "}
            &mdash; MySQL, MariaDB, PlanetScale
          </li>
          <li>
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm">
              sql_dialect: &quot;sqlite&quot;
            </code>{" "}
            &mdash; SQLite, Turso, LibSQL
          </li>
        </ul>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">
          Generate SQL and Save to File
        </h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`// scripts/generate-sql.ts
// Run: npx tsx scripts/generate-sql.ts

import { writeFileSync } from "fs";

const MOCKHERO_API_KEY = process.env.MOCKHERO_API_KEY!;

async function main() {
  const res = await fetch("https://mockhero.dev/api/v1/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: \`Bearer \${MOCKHERO_API_KEY}\`,
    },
    body: JSON.stringify({
      template: "ecommerce",
      scale: 1,
      format: "sql",
      sql_dialect: "postgres", // or "mysql" or "sqlite"
    }),
  });

  if (!res.ok) throw new Error(\`MockHero API error: \${res.status}\`);
  const { data } = await res.json();

  writeFileSync("seed.sql", data.sql);
  console.log("Wrote seed.sql");
}

main();`}
        </pre>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">
          Pipe to Database CLI
        </h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`# PostgreSQL
npx tsx scripts/generate-sql.ts && psql $DATABASE_URL < seed.sql

# MySQL
npx tsx scripts/generate-sql.ts && mysql -u root -p mydb < seed.sql

# SQLite
npx tsx scripts/generate-sql.ts && sqlite3 dev.db < seed.sql`}
        </pre>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">
          One-Liner with curl
        </h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`# Generate and seed in one command (PostgreSQL)
curl -s -X POST https://mockhero.dev/api/v1/generate \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer mh_YOUR_API_KEY" \\
  -d '{"template":"ecommerce","scale":1,"format":"sql","sql_dialect":"postgres"}' \\
  | jq -r '.data.sql' \\
  | psql $DATABASE_URL`}
        </pre>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">
          Common Gotchas
        </h3>
        <ul className="mt-2 list-disc pl-6 text-muted-foreground space-y-1">
          <li>
            <strong>Dialect mismatch:</strong> Make sure{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm">
              sql_dialect
            </code>{" "}
            matches your database. PostgreSQL uses{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm">
              UUID
            </code>{" "}
            types; MySQL uses{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm">
              VARCHAR(36)
            </code>
            .
          </li>
          <li>
            <strong>Tables must exist:</strong> The SQL output contains INSERT
            statements only, not CREATE TABLE. Create your tables first.
          </li>
          <li>
            <strong>FK ordering:</strong> MockHero&apos;s SQL output is already
            ordered correctly &mdash; parent inserts come before children.
          </li>
        </ul>
      </section>

      <Separator />

      {/* ---------------------------------------------------------------- */}
      {/* 7. MongoDB */}
      {/* ---------------------------------------------------------------- */}
      <section>
        <h2 id="mongodb" className="text-xl sm:text-2xl font-bold">
          7. MongoDB
        </h2>
        <p className="mt-2 text-muted-foreground">
          MongoDB has no foreign key constraints, but MockHero&apos;s reference
          IDs are still useful for application-level joins via{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm">
            $lookup
          </code>{" "}
          aggregations.
        </p>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">
          Prerequisites
        </h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`npm install mongodb`}
        </pre>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">
          Complete Seed Script
        </h3>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm font-mono">
{`// scripts/seed.ts
// Run: npx tsx scripts/seed.ts

import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGO_URI!; // e.g. "mongodb://localhost:27017"
const DB_NAME = process.env.DB_NAME || "mockhero_dev";
const MOCKHERO_API_KEY = process.env.MOCKHERO_API_KEY!;

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  console.log("Generating mock data...");
  const res = await fetch("https://mockhero.dev/api/v1/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: \`Bearer \${MOCKHERO_API_KEY}\`,
    },
    body: JSON.stringify({
      template: "ecommerce",
      scale: 1,
      format: "json",
    }),
  });

  if (!res.ok) throw new Error(\`MockHero API error: \${res.status}\`);
  const { data } = await res.json();

  const collections = ["customers", "products", "orders", "order_items", "reviews"];

  for (const name of collections) {
    const rows = data[name];
    if (!rows || rows.length === 0) continue;

    // Map MockHero's "id" to MongoDB's "_id" for cleaner lookups
    const docs = rows.map((row: Record<string, unknown>) => ({
      _id: row.id,
      ...row,
    }));

    // insertMany handles batching internally
    const result = await db.collection(name).insertMany(docs);
    console.log(\`  Inserted \${result.insertedCount} docs into \${name}\`);
  }

  console.log("Done!");
  await client.close();
}

main();`}
        </pre>

        <h3 className="mt-6 text-base sm:text-lg font-semibold">
          Common Gotchas
        </h3>
        <ul className="mt-2 list-disc pl-6 text-muted-foreground space-y-1">
          <li>
            <strong>No FK constraints:</strong> MongoDB won&apos;t validate that{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm">
              customer_id
            </code>{" "}
            in an order matches an actual customer. MockHero ensures all refs
            are valid at generation time.
          </li>
          <li>
            <strong>_id mapping:</strong> Consider mapping MockHero&apos;s{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm">
              id
            </code>{" "}
            field to{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm">
              _id
            </code>{" "}
            for idiomatic MongoDB usage.
          </li>
          <li>
            <strong>insertMany limit:</strong> MongoDB&apos;s default max
            message size is 16 MB. For very large datasets (scale &gt; 50),
            batch your inserts.
          </li>
          <li>
            <strong>Indexes:</strong> Create indexes on reference fields (e.g.{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm">
              customer_id
            </code>
            ) for efficient{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm">
              $lookup
            </code>{" "}
            queries.
          </li>
        </ul>
      </section>

      <Separator />

      {/* ---------------------------------------------------------------- */}
      {/* Summary */}
      {/* ---------------------------------------------------------------- */}
      <section>
        <h2 id="summary" className="text-xl sm:text-2xl font-bold">
          Summary
        </h2>
        <p className="mt-2 text-muted-foreground">
          The pattern is always the same:
        </p>
        <ol className="mt-2 list-decimal pl-6 text-muted-foreground space-y-1">
          <li>
            Call MockHero&apos;s{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm">
              /api/v1/generate
            </code>{" "}
            with your template and format.
          </li>
          <li>
            Insert the data using your database&apos;s native driver or ORM.
          </li>
          <li>
            Respect dependency order: parent tables first, then children.
          </li>
          <li>
            Batch large datasets to stay within driver/database limits.
          </li>
        </ol>
        <p className="mt-4 text-muted-foreground">
          For the fastest approach with any SQL database, use{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm">
            format: &quot;sql&quot;
          </code>{" "}
          and pipe the output directly into your database CLI. For ORMs and
          document databases, use{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm">
            format: &quot;json&quot;
          </code>{" "}
          and insert the data programmatically.
        </p>
      </section>
    </div>
  )
}
