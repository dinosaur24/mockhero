import type { TemplateDefinition } from "./types";

export const ecommerceTemplate: TemplateDefinition = {
  id: "ecommerce",
  name: "E-Commerce",
  description:
    "Storefront with customers, products, orders, line items, and reviews. Weighted country distribution triggers auto-locale for names, emails, and addresses.",
  tables: ["customers", "products", "orders", "order_items", "reviews"],
  default_counts: {
    customers: 100,
    products: 50,
    orders: 300,
    order_items: 900,
    reviews: 200,
  },
  schema: {
    tables: [
      {
        name: "customers",
        count: 100,
        fields: [
          { name: "id", type: "uuid" },
          {
            name: "country",
            type: "enum",
            params: {
              values: ["US", "GB", "DE", "FR", "JP", "ES"],
              weights: [35, 15, 15, 12, 12, 11],
            },
          },
          { name: "first_name", type: "first_name" },
          { name: "last_name", type: "last_name" },
          { name: "email", type: "email" },
          { name: "phone", type: "phone" },
          { name: "address", type: "address" },
          { name: "city", type: "city" },
          { name: "postal_code", type: "postal_code" },
          { name: "avatar_url", type: "avatar_url" },
          { name: "created_at", type: "datetime", params: { min: "2024-01-01", max: "2026-03-01" } },
          { name: "updated_at", type: "datetime", params: { min: "2025-06-01", max: "2026-03-20" } },
          { name: "is_active", type: "boolean", params: { probability: 0.92 } },
        ],
      },
      {
        name: "products",
        count: 50,
        fields: [
          { name: "id", type: "uuid" },
          { name: "name", type: "product_name" },
          { name: "description", type: "product_description" },
          {
            name: "category",
            type: "enum",
            params: {
              values: ["Electronics", "Clothing", "Home & Garden", "Sports", "Books", "Toys"],
              weights: [25, 25, 15, 15, 10, 10],
            },
          },
          { name: "price", type: "price", params: { min: 4.99, max: 499.99 } },
          { name: "sku", type: "sku" },
          { name: "image_url", type: "image_url" },
          { name: "stock_quantity", type: "integer", params: { min: 0, max: 500 } },
          { name: "created_at", type: "datetime", params: { min: "2024-01-01", max: "2026-01-01" } },
          { name: "updated_at", type: "datetime", params: { min: "2025-06-01", max: "2026-03-20" } },
        ],
      },
      {
        name: "orders",
        count: 300,
        fields: [
          { name: "id", type: "uuid" },
          { name: "order_number", type: "sequence", params: { prefix: "ORD-", start: 1001 } },
          { name: "customer_id", type: "ref", params: { table: "customers", field: "id" } },
          {
            name: "status",
            type: "enum",
            params: {
              values: ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"],
              weights: [8, 12, 15, 50, 10, 5],
            },
          },
          { name: "total", type: "price", params: { min: 9.99, max: 1299.99 } },
          { name: "currency", type: "currency" },
          {
            name: "payment_method",
            type: "enum",
            params: { values: ["credit_card", "paypal", "apple_pay", "bank_transfer"] , weights: [45, 25, 20, 10] },
          },
          { name: "ordered_at", type: "datetime", params: { min: "2025-01-01", max: "2026-03-20" } },
          { name: "updated_at", type: "datetime", params: { min: "2025-06-01", max: "2026-03-20" } },
        ],
      },
      {
        name: "order_items",
        count: 900,
        fields: [
          { name: "id", type: "uuid" },
          { name: "order_id", type: "ref", params: { table: "orders", field: "id" } },
          { name: "product_id", type: "ref", params: { table: "products", field: "id" } },
          { name: "quantity", type: "integer", params: { min: 1, max: 5 } },
          { name: "unit_price", type: "price", params: { min: 4.99, max: 499.99 } },
        ],
      },
      {
        name: "reviews",
        count: 200,
        fields: [
          { name: "id", type: "uuid" },
          { name: "customer_id", type: "ref", params: { table: "customers", field: "id" } },
          { name: "product_id", type: "ref", params: { table: "products", field: "id" } },
          { name: "rating", type: "rating" },
          { name: "title", type: "title" },
          { name: "body", type: "review" },
          { name: "created_at", type: "datetime", params: { min: "2025-01-01", max: "2026-03-20" } },
        ],
      },
    ],
  },
};
