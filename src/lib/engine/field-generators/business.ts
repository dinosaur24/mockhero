/**
 * Business field generators: company_name, job_title, department, product_name, price/amount/decimal, currency
 */

import type { FieldGenerator } from "../types";

const COMPANY_PREFIXES = [
  "Global", "Digital", "Smart", "NextGen", "Apex", "Core", "Peak", "Prime",
  "Blue", "Nova", "Stellar", "Urban", "Green", "Bright", "Swift", "Elite",
  "Vertex", "Quantum", "Alpha", "Zen", "Neo", "Pulse", "Arc", "Vibe",
];

const COMPANY_SUFFIXES = [
  "Technologies", "Solutions", "Systems", "Industries", "Labs", "Digital",
  "Group", "Dynamics", "Analytics", "Ventures", "Software", "Media",
  "Networks", "Cloud", "AI", "Innovations", "Partners", "Consulting",
  "Services", "Works", "Studio", "Hub", "Co", "Inc",
];

export const companyNameGenerator: FieldGenerator = (_params, ctx) => {
  return `${ctx.prng.pick(COMPANY_PREFIXES)} ${ctx.prng.pick(COMPANY_SUFFIXES)}`;
};

const JOB_TITLES = [
  "Software Engineer", "Senior Software Engineer", "Staff Engineer",
  "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "Product Manager", "Senior Product Manager", "Product Designer",
  "UX Designer", "UI Designer", "UX Researcher",
  "Data Scientist", "Data Engineer", "Machine Learning Engineer",
  "DevOps Engineer", "Site Reliability Engineer", "Cloud Architect",
  "Engineering Manager", "VP of Engineering", "CTO",
  "Marketing Manager", "Content Strategist", "Growth Manager",
  "Sales Representative", "Account Executive", "Customer Success Manager",
  "Project Manager", "Scrum Master", "Agile Coach",
  "QA Engineer", "Security Engineer", "Solutions Architect",
  "Technical Writer", "Business Analyst", "Financial Analyst",
  "HR Manager", "Recruiter", "Office Manager",
  "CEO", "COO", "CFO", "CMO",
];

export const jobTitleGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.pick(JOB_TITLES);
};

const DEPARTMENTS = [
  "Engineering", "Product", "Design", "Marketing", "Sales",
  "Customer Success", "Operations", "Finance", "Human Resources",
  "Legal", "Research", "Data", "Security", "Infrastructure",
  "QA", "DevOps", "Support", "Executive",
];

export const departmentGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.pick(DEPARTMENTS);
};

const PRODUCT_CATEGORIES: Record<string, string[]> = {
  electronics: [
    "Wireless Bluetooth Headphones", "USB-C Charging Hub", "Mechanical Keyboard",
    "4K Webcam", "Portable SSD 1TB", "Smart Watch", "Noise Cancelling Earbuds",
    "LED Desk Lamp", "Gaming Mouse", "Wireless Charger Pad", "Monitor Stand",
    "Laptop Sleeve", "Phone Stand", "Power Bank 20000mAh", "Smart Speaker",
  ],
  clothing: [
    "Cotton T-Shirt", "Slim Fit Jeans", "Merino Wool Sweater", "Casual Hoodie",
    "Running Shoes", "Leather Belt", "Wool Scarf", "Canvas Backpack",
    "Denim Jacket", "Linen Shirt", "Sneakers", "Baseball Cap",
  ],
  food: [
    "Organic Dark Chocolate 85%", "Artisan Sourdough Bread", "Cold Brew Coffee",
    "Extra Virgin Olive Oil", "Aged Parmesan Cheese", "Raw Honey",
    "Matcha Green Tea", "Protein Bar Box", "Dried Mango Slices",
    "Sparkling Water 12-Pack", "Granola Mix", "Almond Butter",
  ],
  home: [
    "Ceramic Coffee Mug", "Scented Candle", "Throw Pillow", "Wall Clock",
    "Plant Pot", "Kitchen Scale", "French Press", "Cutting Board",
    "Towel Set", "Doormat", "Storage Box", "Photo Frame",
  ],
  software: [
    "Annual Pro License", "Team Subscription", "Enterprise Plan",
    "Developer Tools Bundle", "Cloud Storage 2TB", "VPN Service 1 Year",
    "Password Manager Premium", "Design Tool License", "IDE Pro License",
  ],
};

export const productNameGenerator: FieldGenerator = (params, ctx) => {
  const category = params.category as string | undefined;
  if (category && PRODUCT_CATEGORIES[category]) {
    return ctx.prng.pick(PRODUCT_CATEGORIES[category]);
  }
  // Pick from all categories
  const allProducts = Object.values(PRODUCT_CATEGORIES).flat();
  return ctx.prng.pick(allProducts);
};

export const priceGenerator: FieldGenerator = (params, ctx) => {
  const min = (params.min as number) ?? 0.99;
  const max = (params.max as number) ?? 999.99;
  const precision = (params.precision as number) ?? 2;
  return ctx.prng.nextFloat(min, max, precision);
};

// amount and decimal are aliases for price
export const amountGenerator = priceGenerator;
export const decimalGenerator: FieldGenerator = (params, ctx) => {
  const min = (params.min as number) ?? 0;
  const max = (params.max as number) ?? 1000;
  const precision = (params.precision as number) ?? 2;
  return ctx.prng.nextFloat(min, max, precision);
};

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "SEK", "NOK", "DKK"];

export const currencyGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.pick(CURRENCIES);
};

export const ratingGenerator: FieldGenerator = (params, ctx) => {
  const min = (params.min as number) ?? 1;
  const max = (params.max as number) ?? 5;
  const precision = (params.precision as number) ?? 1;
  // Skew toward higher ratings (realistic distribution)
  const weights = [5, 8, 15, 30, 42]; // 1-star through 5-star
  const rating = ctx.prng.weightedPick([1, 2, 3, 4, 5], weights);
  if (precision === 0) return Math.max(min, Math.min(max, rating));
  return ctx.prng.nextFloat(Math.max(min, rating - 0.5), Math.min(max, rating + 0.4), precision);
};
