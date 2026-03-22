// JSON-LD structured data for LLM and search engine discoverability.
// All content is hardcoded (no user input), so dangerouslySetInnerHTML is safe here.

export function StructuredData() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MockHero",
    url: "https://mockhero.dev",
    logo: "https://mockhero.dev/logo.png",
    sameAs: ["https://x.com/mockherodev", "https://www.npmjs.com/package/@mockherodev/mcp-server"],
    description:
      "MockHero is a synthetic test data API that generates realistic, relational data with 156+ field types across 22 locales.",
    foundingDate: "2026",
    contactPoint: {
      "@type": "ContactPoint",
      email: "hello@mockhero.dev",
      contactType: "customer support",
    },
  };

  const softwareApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "MockHero",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    url: "https://mockhero.dev",
    description:
      "Synthetic test data API for developers. Generate realistic fake data with 156 field types, 22 locales, relational integrity, and multiple output formats (JSON, CSV, SQL). Supports schema-based generation, plain English prompts, and pre-built templates.",
    offers: [
      {
        "@type": "Offer",
        name: "Free",
        price: "0",
        priceCurrency: "USD",
        description: "1,000 records/day, 100 records/request, JSON output, all 156 field types, 22 locales",
      },
      {
        "@type": "Offer",
        name: "Pro",
        price: "29",
        priceCurrency: "USD",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "29",
          priceCurrency: "USD",
          billingDuration: "P1M",
        },
        description: "100,000 records/day, 10,000 records/request, JSON + CSV + SQL output, seeds, schema detection",
      },
      {
        "@type": "Offer",
        name: "Scale",
        price: "79",
        priceCurrency: "USD",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "79",
          priceCurrency: "USD",
          billingDuration: "P1M",
        },
        description: "1,000,000 records/day, 50,000 records/request, webhooks, bulk async generation",
      },
    ],
    featureList: [
      "156 built-in field types",
      "22 locale-aware data sets",
      "Relational data with foreign keys",
      "JSON, CSV, and SQL output formats",
      "Plain English prompt-based generation",
      "Pre-built schema templates (ecommerce, blog, SaaS, social)",
      "MCP server for AI coding agents",
      "Schema detection from existing databases",
      "Deterministic output with seed values",
      "Webhook delivery for async workflows",
      "Bulk async generation for large datasets",
      "Sub-50ms generation time",
    ],
    screenshot: "https://mockhero.dev/og-image.png",
  };

  const apiDoc = {
    "@context": "https://schema.org",
    "@type": "WebAPI",
    name: "MockHero API",
    url: "https://mockhero.dev/docs/api-reference",
    documentation: "https://mockhero.dev/docs",
    description:
      "REST API for generating synthetic test data. Send a JSON schema or plain English description, receive realistic fake data in JSON, CSV, or SQL format.",
    provider: {
      "@type": "Organization",
      name: "MockHero",
      url: "https://mockhero.dev",
    },
  };

  const faqItems = [
    {
      question: "What is MockHero?",
      answer:
        "MockHero is a synthetic test data API that generates realistic, relational fake data for developers. It supports 156 field types, 22 locales, and outputs JSON, CSV, or SQL.",
    },
    {
      question: "How do I generate test data with MockHero?",
      answer:
        "Send a POST request to /api/v1/generate with a JSON schema describing your tables and fields. You can also use plain English prompts or pre-built templates for common schemas like ecommerce, blog, or SaaS.",
    },
    {
      question: "What field types does MockHero support?",
      answer:
        "MockHero supports 156+ field types including uuid, email, full_name, phone, address, company, credit_card, iban, ip_address, url, date, timestamp, price, latitude, longitude, color, avatar, paragraph, and many more.",
    },
    {
      question: "Does MockHero support relational data?",
      answer:
        "Yes. Use ref fields to create foreign key relationships between tables. MockHero generates referentially consistent data across all related tables.",
    },
    {
      question: "Can I use MockHero with AI coding agents?",
      answer:
        "Yes. MockHero provides an MCP (Model Context Protocol) server that works with Claude Desktop, Claude Code, Cursor, and other AI-powered development tools. Install it via npx @mockherodev/mcp-server.",
    },
    {
      question: "Is MockHero free?",
      answer:
        "Yes. The free tier includes 1,000 records/day, 100 records/request, all 156 field types, all 22 locales, and JSON output. Paid plans start at $29/month for higher limits and additional output formats.",
    },
    {
      question: "What output formats does MockHero support?",
      answer:
        "MockHero outputs JSON (all plans), CSV (Pro and Scale), and SQL with dialect support for PostgreSQL, MySQL, and SQLite (Pro and Scale).",
    },
    {
      question: "What locales does MockHero support?",
      answer:
        "MockHero supports 22 locales including en, de, fr, es, it, pt, nl, pl, cs, sk, hr, ro, hu, bg, sv, da, fi, nb, ja, ko, zh, and ar.",
    },
  ];

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MockHero",
    url: "https://mockhero.dev",
    description: "Synthetic test data API for developers and AI coding agents.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://mockhero.dev/docs?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const schemas = [organization, softwareApp, apiDoc, faq, website];

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          suppressHydrationWarning
          // Safe: all content is hardcoded constants, no user input
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
