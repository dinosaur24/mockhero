/**
 * Tier 2 field generators — trivial "pick from array" types.
 *
 * Every generator in this file follows the same pattern: pick from a
 * predefined list (uniform or weighted).  A few (nickname, discountCode,
 * colorRgb, label) add a tiny bit of derivation logic on top.
 */

import type { FieldGenerator } from "../types";

// ── IDENTITY ──────────────────────────────────────────────

/**
 * Name prefix / title.
 * Weighted toward common titles.
 */
const NAME_PREFIXES = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof."];
const NAME_PREFIX_WEIGHTS = [0.3, 0.25, 0.25, 0.12, 0.08];

export const namePrefixGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.weightedPick(NAME_PREFIXES, NAME_PREFIX_WEIGHTS);
};

/**
 * Name suffix.
 */
const NAME_SUFFIXES = ["Jr.", "Sr.", "II", "III", "PhD", "MD", "Esq."];
const NAME_SUFFIX_WEIGHTS = [0.3, 0.2, 0.15, 0.1, 0.1, 0.1, 0.05];

export const nameSuffixGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.weightedPick(NAME_SUFFIXES, NAME_SUFFIX_WEIGHTS);
};

/**
 * Nickname — derived from first_name in currentRecord when possible,
 * otherwise picked from a pool of fun nicknames.
 */
const NICKNAMES = [
  "Ace", "Buddy", "Chief", "Doc", "Flash", "Jazz", "Max", "Red", "Spike",
  "Tex", "Zippy", "Bear", "Blue", "Chip", "Duke", "Echo", "Frost", "Ghost",
  "Hawk", "Iron", "Jinx", "Kit", "Luna", "Neon", "Pixel", "Rocky", "Shadow",
  "Storm", "Turbo", "Viper",
];

const SHORT_FORM_SUFFIXES = ["ny", "y", "ie"];

export const nicknameGenerator: FieldGenerator = (_params, ctx) => {
  const firstName = ctx.currentRecord.first_name as string | undefined;

  // Attempt to derive a short-form nickname from first_name
  if (firstName && firstName.length >= 3 && ctx.prng.chance(0.4)) {
    const base = firstName.slice(0, ctx.prng.nextInt(3, Math.min(4, firstName.length)));
    const suffix = ctx.prng.pick(SHORT_FORM_SUFFIXES);
    return base + suffix;
  }

  return ctx.prng.pick(NICKNAMES);
};

/**
 * Marital status.
 */
const MARITAL_STATUSES = [
  "single", "married", "divorced", "widowed", "separated", "domestic_partnership",
];
const MARITAL_WEIGHTS = [0.35, 0.4, 0.1, 0.05, 0.05, 0.05];

export const maritalStatusGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.weightedPick(MARITAL_STATUSES, MARITAL_WEIGHTS);
};

/**
 * Nationality.
 */
const NATIONALITIES = [
  "American", "British", "German", "French", "Spanish", "Italian",
  "Japanese", "Chinese", "Korean", "Indian", "Brazilian", "Canadian",
  "Australian", "Mexican", "Dutch", "Swedish", "Norwegian", "Danish",
  "Finnish", "Polish", "Croatian", "Russian", "Turkish", "Egyptian",
  "Nigerian", "South African", "Argentinian", "Colombian", "Thai",
  "Vietnamese",
];

export const nationalityGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.pick(NATIONALITIES);
};

/**
 * Blood type with realistic worldwide distribution weights.
 */
const BLOOD_TYPES = ["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"];
const BLOOD_TYPE_WEIGHTS = [0.374, 0.357, 0.085, 0.034, 0.066, 0.063, 0.015, 0.006];

export const bloodTypeGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.weightedPick(BLOOD_TYPES, BLOOD_TYPE_WEIGHTS);
};

/**
 * Pronoun set.
 */
const PRONOUN_SETS = ["he/him", "she/her", "they/them", "he/they", "she/they", "ze/hir"];
const PRONOUN_WEIGHTS = [0.42, 0.42, 0.1, 0.03, 0.02, 0.01];

export const pronounSetGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.weightedPick(PRONOUN_SETS, PRONOUN_WEIGHTS);
};

// ── LOCATION ──────────────────────────────────────────────

/**
 * ISO 3166-1 alpha-2 country codes.
 */
const COUNTRY_CODES = [
  "US", "GB", "DE", "FR", "ES", "IT", "JP", "CN", "KR", "IN",
  "BR", "CA", "AU", "MX", "NL", "SE", "NO", "DK", "FI", "PL",
  "HR", "RU", "TR", "EG", "NG", "ZA", "AR", "CO", "TH", "VN",
  "PT", "IE", "CH", "AT", "BE",
];

export const countryCodeGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.pick(COUNTRY_CODES);
};

/**
 * Real-world neighborhoods.
 */
const NEIGHBORHOODS = [
  "SoHo", "Tribeca", "Williamsburg", "Silver Lake", "Capitol Hill",
  "Nob Hill", "Gaslamp Quarter", "Wicker Park", "Midtown", "Downtown",
  "Westside", "Eastside", "Old Town", "Riverside", "Lakeside",
  "Harbor District", "Arts District", "Financial District", "Tech Quarter",
  "University District", "Garden District", "Historic Quarter",
  "Market District", "Waterfront", "Le Marais", "Shibuya", "Kreuzberg",
  "Gracia", "Trastevere", "Jordaan", "Sodermalm", "Alfama",
  "Shimokitazawa", "Coyoacan", "Palermo Soho", "Fitzroy", "Shoreditch",
  "Prenzlauer Berg", "Barrio Gotico", "Bairro Alto",
];

export const neighborhoodGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.pick(NEIGHBORHOODS);
};

// ── FINANCIAL ─────────────────────────────────────────────

/**
 * Bank name.
 */
const BANK_NAMES = [
  "Chase", "Bank of America", "Wells Fargo", "Citibank", "Goldman Sachs",
  "Morgan Stanley", "HSBC", "Barclays", "Deutsche Bank", "BNP Paribas",
  "Credit Suisse", "UBS", "ING", "Revolut", "N26", "Wise", "Monzo",
  "Chime", "SoFi", "Ally Bank", "Capital One", "TD Bank", "US Bank",
  "PNC", "Santander",
];

export const bankNameGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.pick(BANK_NAMES);
};

/**
 * Payment method.
 */
const PAYMENT_METHODS = [
  "credit_card", "debit_card", "paypal", "apple_pay", "google_pay",
  "bank_transfer", "crypto", "cash", "invoice", "afterpay",
];
const PAYMENT_METHOD_WEIGHTS = [0.30, 0.20, 0.15, 0.10, 0.08, 0.07, 0.03, 0.02, 0.03, 0.02];

export const paymentMethodGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.weightedPick(PAYMENT_METHODS, PAYMENT_METHOD_WEIGHTS);
};

/**
 * Discount / promo code.
 * Picks a template and appends random digits for variety.
 */
const DISCOUNT_TEMPLATES = [
  "SPRING", "WELCOME", "FREESHIP", "SAVE", "FLASH", "VIP", "SUMMER",
  "HOLIDAY", "FIRST", "LOYALTY", "WINTER", "DEAL", "EXTRA", "MEGA",
  "NEWUSER", "THANKS", "SPECIAL", "CYBER", "BLACK", "TREAT",
];

export const discountCodeGenerator: FieldGenerator = (_params, ctx) => {
  const template = ctx.prng.pick(DISCOUNT_TEMPLATES);
  const number = ctx.prng.nextInt(5, 50) * 5; // multiples of 5: 25, 30, etc.
  return `${template}${number}`;
};

// ── ECOMMERCE ─────────────────────────────────────────────

/**
 * Shipping carrier.
 */
const SHIPPING_CARRIERS = [
  "UPS", "FedEx", "USPS", "DHL", "Royal Mail", "Australia Post",
  "Canada Post", "Deutsche Post", "La Poste", "Correos",
];

export const shippingCarrierGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.pick(SHIPPING_CARRIERS);
};

/**
 * Order status — weighted toward "delivered" as most orders complete.
 */
const ORDER_STATUSES = [
  "pending", "confirmed", "processing", "shipped", "in_transit",
  "out_for_delivery", "delivered", "returned", "refunded", "cancelled",
];
const ORDER_STATUS_WEIGHTS = [0.08, 0.07, 0.10, 0.10, 0.08, 0.05, 0.35, 0.05, 0.07, 0.05];

export const orderStatusGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.weightedPick(ORDER_STATUSES, ORDER_STATUS_WEIGHTS);
};

// ── TECHNICAL ─────────────────────────────────────────────

/**
 * HTTP method — weighted toward GET and POST.
 */
const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
const HTTP_METHOD_WEIGHTS = [0.40, 0.25, 0.12, 0.08, 0.08, 0.04, 0.03];

export const httpMethodGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.weightedPick(HTTP_METHODS, HTTP_METHOD_WEIGHTS);
};

/**
 * MIME type.
 */
const MIME_TYPES = [
  "application/json", "application/pdf", "application/xml", "text/html",
  "text/csv", "text/plain", "image/png", "image/jpeg", "image/svg+xml",
  "image/webp", "video/mp4", "audio/mpeg", "application/zip",
  "application/gzip", "application/javascript", "text/css",
  "application/octet-stream", "multipart/form-data",
  "application/x-www-form-urlencoded", "font/woff2",
];

export const mimeTypeGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.pick(MIME_TYPES);
};

/**
 * File extension.
 */
const FILE_EXTENSIONS = [
  ".pdf", ".docx", ".xlsx", ".csv", ".json", ".xml", ".html", ".css",
  ".js", ".ts", ".py", ".go", ".rs", ".jpg", ".png", ".svg", ".mp4",
  ".mp3", ".zip", ".gz", ".tar", ".md", ".txt", ".yaml", ".toml",
];

export const fileExtensionGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.pick(FILE_EXTENSIONS);
};

/**
 * Programming language.
 */
const PROGRAMMING_LANGUAGES = [
  "TypeScript", "JavaScript", "Python", "Go", "Rust", "Java", "C#", "C++",
  "Ruby", "PHP", "Swift", "Kotlin", "Scala", "Elixir", "Haskell",
  "Clojure", "Dart", "R", "Julia", "Zig",
];

export const programmingLanguageGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.pick(PROGRAMMING_LANGUAGES);
};

/**
 * Database engine.
 */
const DATABASE_ENGINES = [
  "PostgreSQL", "MySQL", "SQLite", "MongoDB", "Redis", "DynamoDB",
  "Cassandra", "Neo4j", "ClickHouse", "CockroachDB", "Supabase",
  "PlanetScale", "Neon", "Turso", "Firebase",
];

export const databaseEngineGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.pick(DATABASE_ENGINES);
};

// ── CONTENT ───────────────────────────────────────────────

/**
 * Emoji — common unicode emojis.
 */
const EMOJIS = [
  "\u{1F680}", "\u{1F389}", "\u2728", "\u{1F525}", "\u{1F4A1}", "\u2764\uFE0F",
  "\u{1F44D}", "\u{1F3AF}", "\u26A1", "\u{1F31F}", "\u{1F4AA}", "\u{1F64C}",
  "\u{1F91D}", "\u{1F4BB}", "\u{1F4F1}", "\u{1F3A8}", "\u{1F527}", "\u{1F4CA}",
  "\u{1F3C6}", "\u{1F308}", "\u2615", "\u{1F3B5}", "\u{1F4DD}", "\u{1F511}",
  "\u{1F48E}", "\u{1F30D}", "\u{1F3AA}", "\u{1F6E0}\uFE0F", "\u{1F9EA}", "\u{1F52C}",
  "\u{1F4E6}", "\u{1F5C2}\uFE0F", "\u{1F512}", "\u{1F513}", "\u2705", "\u274C",
  "\u26A0\uFE0F", "\u{1F4AC}", "\u{1F4E2}", "\u{1F381}", "\u{1F355}", "\u{1F331}",
  "\u{1F41B}", "\u{1F980}", "\u{1F40D}", "\u2601\uFE0F", "\u{1F319}", "\u{1F52E}",
  "\u{1F3B2}", "\u{1F9E9}",
];

export const emojiGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.pick(EMOJIS);
};

/**
 * Reaction type — weighted toward "like".
 */
const REACTIONS = ["like", "love", "haha", "wow", "sad", "angry", "care", "celebrate"];
const REACTION_WEIGHTS = [0.35, 0.20, 0.15, 0.10, 0.08, 0.05, 0.04, 0.03];

export const reactionGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.weightedPick(REACTIONS, REACTION_WEIGHTS);
};

// ── SOCIAL ────────────────────────────────────────────────

/**
 * Social platform.
 */
const SOCIAL_PLATFORMS = [
  "Twitter/X", "Instagram", "LinkedIn", "TikTok", "YouTube", "Reddit",
  "Facebook", "Threads", "Mastodon", "Bluesky", "Discord", "Twitch",
];

export const socialPlatformGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.pick(SOCIAL_PLATFORMS);
};

// ── HR & ORGANIZATION ─────────────────────────────────────

/**
 * Employment status.
 */
const EMPLOYMENT_STATUSES = [
  "full-time", "part-time", "contractor", "freelance", "intern",
  "temporary", "remote", "hybrid",
];
const EMPLOYMENT_STATUS_WEIGHTS = [0.45, 0.12, 0.15, 0.10, 0.05, 0.03, 0.05, 0.05];

export const employmentStatusGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.weightedPick(EMPLOYMENT_STATUSES, EMPLOYMENT_STATUS_WEIGHTS);
};

/**
 * Seniority level.
 */
const SENIORITY_LEVELS = [
  "Intern", "Junior", "Mid", "Senior", "Staff", "Principal", "Lead",
  "Manager", "Director", "VP", "C-Suite",
];
const SENIORITY_LEVEL_WEIGHTS = [0.05, 0.12, 0.25, 0.25, 0.10, 0.05, 0.05, 0.05, 0.04, 0.02, 0.02];

export const seniorityLevelGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.weightedPick(SENIORITY_LEVELS, SENIORITY_LEVEL_WEIGHTS);
};

/**
 * Skill / technology.
 */
const SKILLS = [
  "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python",
  "SQL", "AWS", "Docker", "Kubernetes", "Git", "CI/CD", "GraphQL",
  "REST APIs", "PostgreSQL", "MongoDB", "Redis", "Tailwind CSS", "Figma",
  "Data Analysis", "Machine Learning", "Project Management", "Agile/Scrum",
  "Communication", "Leadership", "Product Strategy", "UX Design", "DevOps",
  "Security", "Testing/QA", "Technical Writing", "Cloud Architecture",
  "Microservices", "System Design", "Mobile Development", "iOS", "Android",
  "Flutter", "Vue.js", "Angular",
];

export const skillGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.pick(SKILLS);
};

/**
 * Leave / time-off type.
 */
const LEAVE_TYPES = [
  "Annual Leave", "Sick Leave", "Parental Leave", "Bereavement",
  "Personal Day", "Jury Duty", "Military Leave", "Sabbatical",
  "Unpaid Leave", "Work From Home",
];

export const leaveTypeGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.pick(LEAVE_TYPES);
};

// ── HEALTHCARE ────────────────────────────────────────────

/**
 * Medical specialty.
 */
const MEDICAL_SPECIALTIES = [
  "Cardiology", "Dermatology", "Emergency Medicine", "Endocrinology",
  "Gastroenterology", "Geriatrics", "Hematology", "Infectious Disease",
  "Nephrology", "Neurology", "Obstetrics", "Oncology", "Ophthalmology",
  "Orthopedics", "Pediatrics", "Psychiatry", "Pulmonology", "Radiology",
  "Rheumatology", "Urology",
];

export const medicalSpecialtyGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.pick(MEDICAL_SPECIALTIES);
};

/**
 * Allergy.
 */
const ALLERGIES = [
  "Penicillin", "Peanuts", "Shellfish", "Latex", "Bee Stings",
  "Sulfa Drugs", "Aspirin", "Ibuprofen", "Eggs", "Milk", "Soy",
  "Wheat/Gluten", "Tree Nuts", "Fish", "Dust Mites", "Mold",
  "Pet Dander", "Pollen", "Codeine", "Contrast Dye",
];

export const allergyGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.pick(ALLERGIES);
};

// ── REAL ESTATE ───────────────────────────────────────────

/**
 * Property type.
 */
const PROPERTY_TYPES = [
  "Single Family Home", "Condo", "Apartment", "Townhouse", "Duplex",
  "Studio", "Loft", "Penthouse", "Villa", "Commercial Office",
  "Retail Space", "Warehouse", "Land/Lot",
];

export const propertyTypeGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.pick(PROPERTY_TYPES);
};

// ── MEDIA ─────────────────────────────────────────────────

/**
 * Music genre.
 */
const MUSIC_GENRES = [
  "Pop", "Rock", "Hip Hop", "R&B", "Jazz", "Classical", "Electronic",
  "Country", "Blues", "Reggae", "Metal", "Punk", "Indie", "Folk", "Soul",
  "Funk", "Latin", "K-Pop", "Lo-fi", "Ambient", "Techno", "House",
  "Drum & Bass", "Synthwave", "Gospel",
];

export const musicGenreGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.pick(MUSIC_GENRES);
};

// ── AI / ML ───────────────────────────────────────────────

/**
 * Classification label.
 * Uses params.values if provided, otherwise sensible defaults.
 */
const DEFAULT_LABELS = [
  "positive", "negative", "neutral", "spam", "not_spam", "urgent",
  "normal", "low_priority", "approved", "rejected", "pending_review",
];

export const labelGenerator: FieldGenerator = (params, ctx) => {
  const values = (params.values as string[]) ?? DEFAULT_LABELS;
  return ctx.prng.pick(values);
};

// ── COLOR ─────────────────────────────────────────────────

/**
 * RGB color string — `rgb(R, G, B)` with random values 0-255.
 */
export const colorRgbGenerator: FieldGenerator = (_params, ctx) => {
  const r = ctx.prng.nextInt(0, 255);
  const g = ctx.prng.nextInt(0, 255);
  const b = ctx.prng.nextInt(0, 255);
  return `rgb(${r}, ${g}, ${b})`;
};

/**
 * Named color — curated list of design-friendly color names.
 */
const COLOR_NAMES = [
  "Cerulean Blue", "Coral", "Slate Gray", "Forest Green", "Royal Purple",
  "Burnt Orange", "Dusty Rose", "Teal", "Champagne", "Burgundy", "Sage",
  "Terracotta", "Navy", "Blush", "Emerald", "Ivory", "Charcoal", "Mauve",
  "Mint", "Rust", "Pewter", "Indigo", "Crimson", "Lavender", "Copper",
  "Olive", "Plum", "Sand", "Azure", "Maroon",
];

export const colorNameGenerator: FieldGenerator = (_params, ctx) => {
  return ctx.prng.pick(COLOR_NAMES);
};
