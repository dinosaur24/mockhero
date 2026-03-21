import { describe, it, expect } from "vitest";
import { generate } from "../generator";
import {
  listTemplates,
  getTemplate,
  generateFromTemplate,
  TEMPLATE_REGISTRY,
} from "../templates";

describe("Template Registry", () => {
  it("listTemplates returns 4 templates", () => {
    const templates = listTemplates();
    expect(templates).toHaveLength(4);

    const ids = templates.map((t) => t.id);
    expect(ids).toContain("ecommerce");
    expect(ids).toContain("blog");
    expect(ids).toContain("saas");
    expect(ids).toContain("social");
  });

  it("listTemplates excludes the schema field", () => {
    const templates = listTemplates();
    for (const t of templates) {
      expect(t).not.toHaveProperty("schema");
      expect(t).toHaveProperty("id");
      expect(t).toHaveProperty("name");
      expect(t).toHaveProperty("description");
      expect(t).toHaveProperty("tables");
      expect(t).toHaveProperty("default_counts");
    }
  });

  it("getTemplate returns a definition for known ids", () => {
    const ecommerce = getTemplate("ecommerce");
    expect(ecommerce).toBeDefined();
    expect(ecommerce!.id).toBe("ecommerce");
    expect(ecommerce!.schema.tables.length).toBe(5);
  });

  it("getTemplate returns undefined for nonexistent id", () => {
    expect(getTemplate("nonexistent")).toBeUndefined();
  });

  it("every template includes a country field for locale detection", () => {
    for (const [id, template] of Object.entries(TEMPLATE_REGISTRY)) {
      const hasCountryField = template.schema.tables.some((t) =>
        t.fields.some((f) => f.name === "country"),
      );
      expect(hasCountryField, `${id} template must include a country field`).toBe(true);
    }
  });
});

describe("generateFromTemplate", () => {
  it("returns a valid GenerateRequest with default scale", () => {
    const request = generateFromTemplate({ template: "blog" });
    expect(request.tables).toHaveLength(5); // authors, posts, comments, tags, post_tags
    expect(request.tables[0].count).toBe(30); // authors default
    expect(request.tables[1].count).toBe(150); // posts default
  });

  it("applies scale multiplier to all table counts", () => {
    const request = generateFromTemplate({ template: "blog", scale: 0.1 });
    // 30 * 0.1 = 3, 150 * 0.1 = 15, 600 * 0.1 = 60, 20 * 0.1 = 2, 400 * 0.1 = 40
    expect(request.tables[0].count).toBe(3);
    expect(request.tables[1].count).toBe(15);
    expect(request.tables[2].count).toBe(60);
    expect(request.tables[3].count).toBe(2);
    expect(request.tables[4].count).toBe(40);
  });

  it("ensures minimum count of 1 after scaling", () => {
    const request = generateFromTemplate({ template: "saas", scale: 0.001 });
    for (const table of request.tables) {
      expect(table.count).toBeGreaterThanOrEqual(1);
    }
  });

  it("overrides locale, format, seed when provided", () => {
    const request = generateFromTemplate({
      template: "ecommerce",
      locale: "de",
      format: "csv",
      seed: 123,
    });
    expect(request.locale).toBe("de");
    expect(request.format).toBe("csv");
    expect(request.seed).toBe(123);
  });

  it("throws for unknown template", () => {
    expect(() => generateFromTemplate({ template: "unknown" })).toThrow(
      'Unknown template: "unknown"',
    );
  });
});

describe("Template generation (integration)", () => {
  const templateIds = Object.keys(TEMPLATE_REGISTRY);

  for (const id of templateIds) {
    it(`${id} template generates without errors (scale=0.1)`, async () => {
      const request = generateFromTemplate({
        template: id,
        scale: 0.1,
        seed: 42,
      });

      const result = await generate(request);
      expect(result.success).toBe(true);
      if (!result.success) return;

      // Every table should have data
      for (const table of request.tables) {
        expect(result.result.data[table.name]).toBeDefined();
        expect(result.result.data[table.name].length).toBe(table.count);
      }
    }, 10_000);
  }

  it("ecommerce: orders → customers, order_items → orders+products, reviews → customers+products", async () => {
    const request = generateFromTemplate({ template: "ecommerce", scale: 0.1, seed: 42 });
    const result = await generate(request);
    expect(result.success).toBe(true);
    if (!result.success) return;

    const customerIds = new Set(result.result.data.customers.map((c) => c.id));
    const productIds = new Set(result.result.data.products.map((p) => p.id));
    const orderIds = new Set(result.result.data.orders.map((o) => o.id));

    for (const order of result.result.data.orders) {
      expect(customerIds.has(order.customer_id as string)).toBe(true);
    }
    for (const item of result.result.data.order_items) {
      expect(orderIds.has(item.order_id as string)).toBe(true);
      expect(productIds.has(item.product_id as string)).toBe(true);
    }
    for (const review of result.result.data.reviews) {
      expect(customerIds.has(review.customer_id as string)).toBe(true);
      expect(productIds.has(review.product_id as string)).toBe(true);
    }
  }, 10_000);

  it("blog: posts → authors, comments → posts+authors, post_tags → posts+tags", async () => {
    const request = generateFromTemplate({ template: "blog", scale: 0.1, seed: 42 });
    const result = await generate(request);
    expect(result.success).toBe(true);
    if (!result.success) return;

    const authorIds = new Set(result.result.data.authors.map((a) => a.id));
    const postIds = new Set(result.result.data.posts.map((p) => p.id));
    const tagIds = new Set(result.result.data.tags.map((t) => t.id));

    for (const post of result.result.data.posts) {
      expect(authorIds.has(post.author_id as string)).toBe(true);
    }
    for (const comment of result.result.data.comments) {
      expect(postIds.has(comment.post_id as string)).toBe(true);
      // Comments use commenter_name/commenter_email (anonymous), not author_id
      expect(comment.commenter_name).toBeDefined();
      expect(comment.commenter_email).toBeDefined();
    }
    for (const pt of result.result.data.post_tags) {
      expect(postIds.has(pt.post_id as string)).toBe(true);
      expect(tagIds.has(pt.tag_id as string)).toBe(true);
    }
  }, 10_000);

  it("saas: members → orgs, subscriptions → orgs, invoices → subscriptions", async () => {
    const request = generateFromTemplate({ template: "saas", scale: 0.1, seed: 42 });
    const result = await generate(request);
    expect(result.success).toBe(true);
    if (!result.success) return;

    const orgIds = new Set(result.result.data.organizations.map((o) => o.id));
    const subIds = new Set(result.result.data.subscriptions.map((s) => s.id));

    for (const member of result.result.data.members) {
      expect(orgIds.has(member.org_id as string)).toBe(true);
    }
    for (const sub of result.result.data.subscriptions) {
      expect(orgIds.has(sub.org_id as string)).toBe(true);
    }
    for (const inv of result.result.data.invoices) {
      expect(subIds.has(inv.subscription_id as string)).toBe(true);
    }
  }, 10_000);

  it("social: posts → users, likes → users+posts, follows → users×users, messages → users×users", async () => {
    const request = generateFromTemplate({ template: "social", scale: 0.1, seed: 42 });
    const result = await generate(request);
    expect(result.success).toBe(true);
    if (!result.success) return;

    const userIds = new Set(result.result.data.users.map((u) => u.id));
    const postIds = new Set(result.result.data.posts.map((p) => p.id));

    for (const post of result.result.data.posts) {
      expect(userIds.has(post.user_id as string)).toBe(true);
    }
    for (const like of result.result.data.likes) {
      expect(userIds.has(like.user_id as string)).toBe(true);
      expect(postIds.has(like.post_id as string)).toBe(true);
    }
    for (const follow of result.result.data.follows) {
      expect(userIds.has(follow.follower_id as string)).toBe(true);
      expect(userIds.has(follow.following_id as string)).toBe(true);
    }
    for (const msg of result.result.data.messages) {
      expect(userIds.has(msg.sender_id as string)).toBe(true);
      expect(userIds.has(msg.receiver_id as string)).toBe(true);
    }
  }, 10_000);
});
