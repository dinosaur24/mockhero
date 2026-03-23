/**
 * Field generator registry.
 * Maps field type names to their generator functions.
 *
 * 156 field types across 15+ categories.
 * The most comprehensive synthetic data type catalog in any API.
 */

import type { FieldGenerator, FieldType } from "../types";

// ── Original generators ──────────────────────────────────

import {
  firstNameGenerator, lastNameGenerator, fullNameGenerator,
  emailGenerator, usernameGenerator, phoneGenerator, avatarUrlGenerator,
} from "./identity";

import {
  cityGenerator, countryGenerator, postalCodeGenerator, addressGenerator,
  stateProvinceGenerator, latitudeGenerator, longitudeGenerator,
} from "./location";

import {
  companyNameGenerator, jobTitleGenerator, departmentGenerator,
  productNameGenerator, priceGenerator, amountGenerator, decimalGenerator,
  currencyGenerator, ratingGenerator,
} from "./business";

import {
  datetimeGenerator, dateGenerator, timeGenerator,
  timestampGenerator, ageGenerator,
} from "./temporal";

import {
  uuidGenerator, idGenerator, ipAddressGenerator, macAddressGenerator,
  urlGenerator, domainGenerator, userAgentGenerator, colorHexGenerator,
} from "./technical";

import {
  sentenceGenerator, paragraphGenerator, titleGenerator, slugGenerator,
  tagGenerator, reviewGenerator, imageUrlGenerator, filePathGenerator,
  jsonGenerator, arrayGenerator, catchPhraseGenerator,
} from "./content";

import {
  blogPostGenerator, blogCommentGenerator,
} from "./llm-content";

import {
  booleanGenerator, enumGenerator, integerGenerator,
  refGenerator, sequenceGenerator, constantGenerator,
} from "./logic";

// ── Tier 1 generators ────────────────────────────────────

import {
  genderGenerator, dateOfBirthGenerator, timezoneGenerator,
  skuGenerator, creditCardNumberGenerator, trackingNumberGenerator,
  dateRangeGenerator, embeddingVectorGenerator, markdownGenerator,
  passwordHashGenerator, xssStringGenerator, sqlInjectionStringGenerator,
} from "./tier1";

// ── Tier 2: Enum-pick generators ─────────────────────────

import {
  namePrefixGenerator, nameSuffixGenerator, nicknameGenerator,
  maritalStatusGenerator, nationalityGenerator, bloodTypeGenerator,
  pronounSetGenerator, countryCodeGenerator, neighborhoodGenerator,
  bankNameGenerator, paymentMethodGenerator, discountCodeGenerator,
  shippingCarrierGenerator, orderStatusGenerator, httpMethodGenerator,
  mimeTypeGenerator, fileExtensionGenerator, programmingLanguageGenerator,
  databaseEngineGenerator, emojiGenerator, reactionGenerator,
  socialPlatformGenerator, employmentStatusGenerator, seniorityLevelGenerator,
  skillGenerator, leaveTypeGenerator, medicalSpecialtyGenerator,
  allergyGenerator, propertyTypeGenerator, musicGenreGenerator,
  labelGenerator, colorRgbGenerator, colorNameGenerator,
} from "./tier2-enums";

// ── Tier 2: Pattern-based generators ─────────────────────

import {
  bioGenerator, ssnGenerator, passportNumberGenerator, phoneE164Generator,
  streetAddressGenerator, addressLine2Generator, localeCodeGenerator,
  creditCardExpiryGenerator, creditCardCvvGenerator, invoiceNumberGenerator,
  swiftCodeGenerator, taxIdGenerator, stockTickerGenerator, walletAddressGenerator,
  productCategoryGenerator, productDescriptionGenerator, barcodeEan13Generator,
  isbnGenerator, weightGenerator,
  dateFutureGenerator, datePastGenerator, durationGenerator, relativeTimeGenerator,
  semverGenerator, apiKeyGenerator, commitShaGenerator, hashMd5Generator,
  hashSha256Generator, portNumberGenerator, httpStatusCodeGenerator,
  fileSizeGenerator, dockerImageGenerator,
  githubUsernameGenerator, twitterHandleGenerator, messageGenerator,
  notificationTextGenerator, hashtagGenerator,
  employeeIdGenerator, salaryGenerator, teamNameGenerator, degreeGenerator,
  universityNameGenerator,
  confidenceScoreGenerator, tokenCountGenerator,
  licenseKeyGenerator, totpSecretGenerator, jwtTokenGenerator,
} from "./tier2-patterns";

// ── Tier 2: Chaos testing generators ─────────────────────

import {
  unicodeStringGenerator, longStringGenerator, boundaryIntegerGenerator,
  emptyStringGenerator, errorValueGenerator, futureProofDateGenerator,
} from "./tier2-chaos";

// ── Registry ─────────────────────────────────────────────

export const GENERATOR_REGISTRY: Record<FieldType, FieldGenerator> = {
  // ── Identity ───────────────────────────────────────────
  first_name: firstNameGenerator,
  last_name: lastNameGenerator,
  full_name: fullNameGenerator,
  email: emailGenerator,
  username: usernameGenerator,
  phone: phoneGenerator,
  avatar_url: avatarUrlGenerator,
  avatar: avatarUrlGenerator,
  gender: genderGenerator,
  date_of_birth: dateOfBirthGenerator,
  name_prefix: namePrefixGenerator,
  name_suffix: nameSuffixGenerator,
  nickname: nicknameGenerator,
  marital_status: maritalStatusGenerator,
  nationality: nationalityGenerator,
  blood_type: bloodTypeGenerator,
  pronoun_set: pronounSetGenerator,
  bio: bioGenerator,
  ssn: ssnGenerator,
  passport_number: passportNumberGenerator,
  phone_e164: phoneE164Generator,

  // ── Location ───────────────────────────────────────────
  city: cityGenerator,
  country: countryGenerator,
  postal_code: postalCodeGenerator,
  address: addressGenerator,
  state_province: stateProvinceGenerator,
  latitude: latitudeGenerator,
  longitude: longitudeGenerator,
  timezone: timezoneGenerator,
  country_code: countryCodeGenerator,
  neighborhood: neighborhoodGenerator,
  street_address: streetAddressGenerator,
  address_line_2: addressLine2Generator,
  locale_code: localeCodeGenerator,

  // ── Financial ──────────────────────────────────────────
  company_name: companyNameGenerator,
  job_title: jobTitleGenerator,
  department: departmentGenerator,
  product_name: productNameGenerator,
  price: priceGenerator,
  amount: amountGenerator,
  decimal: decimalGenerator,
  float: decimalGenerator,
  number: decimalGenerator,
  currency: currencyGenerator,
  rating: ratingGenerator,
  sku: skuGenerator,
  credit_card_number: creditCardNumberGenerator,
  tracking_number: trackingNumberGenerator,
  bank_name: bankNameGenerator,
  payment_method: paymentMethodGenerator,
  discount_code: discountCodeGenerator,
  credit_card_expiry: creditCardExpiryGenerator,
  credit_card_cvv: creditCardCvvGenerator,
  invoice_number: invoiceNumberGenerator,
  swift_code: swiftCodeGenerator,
  tax_id: taxIdGenerator,
  stock_ticker: stockTickerGenerator,
  wallet_address: walletAddressGenerator,

  // ── Ecommerce ──────────────────────────────────────────
  shipping_carrier: shippingCarrierGenerator,
  order_status: orderStatusGenerator,
  product_category: productCategoryGenerator,
  product_description: productDescriptionGenerator,
  barcode_ean13: barcodeEan13Generator,
  isbn: isbnGenerator,
  weight: weightGenerator,

  // ── Temporal ───────────────────────────────────────────
  datetime: datetimeGenerator,
  date: dateGenerator,
  time: timeGenerator,
  timestamp: timestampGenerator,
  age: ageGenerator,
  date_range: dateRangeGenerator,
  date_future: dateFutureGenerator,
  date_past: datePastGenerator,
  duration: durationGenerator,
  relative_time: relativeTimeGenerator,

  // ── Technical ──────────────────────────────────────────
  uuid: uuidGenerator,
  id: idGenerator,
  ip_address: ipAddressGenerator,
  mac_address: macAddressGenerator,
  url: urlGenerator,
  domain: domainGenerator,
  user_agent: userAgentGenerator,
  color_hex: colorHexGenerator,
  embedding_vector: embeddingVectorGenerator,
  http_method: httpMethodGenerator,
  mime_type: mimeTypeGenerator,
  file_extension: fileExtensionGenerator,
  programming_language: programmingLanguageGenerator,
  database_engine: databaseEngineGenerator,
  semver: semverGenerator,
  api_key: apiKeyGenerator,
  commit_sha: commitShaGenerator,
  hash_md5: hashMd5Generator,
  hash_sha256: hashSha256Generator,
  port_number: portNumberGenerator,
  http_status_code: httpStatusCodeGenerator,
  file_size: fileSizeGenerator,
  docker_image: dockerImageGenerator,

  // ── Content ────────────────────────────────────────────
  sentence: sentenceGenerator,
  catch_phrase: catchPhraseGenerator,
  paragraph: paragraphGenerator,
  title: titleGenerator,
  slug: slugGenerator,
  tag: tagGenerator,
  review: reviewGenerator,
  image_url: imageUrlGenerator,
  file_path: filePathGenerator,
  json: jsonGenerator,
  array: arrayGenerator,
  markdown: markdownGenerator,
  emoji: emojiGenerator,
  hashtag: hashtagGenerator,
  message: messageGenerator,
  notification_text: notificationTextGenerator,
  blog_post: blogPostGenerator,
  blog_comment: blogCommentGenerator,

  // ── Social ─────────────────────────────────────────────
  social_platform: socialPlatformGenerator,
  reaction: reactionGenerator,
  github_username: githubUsernameGenerator,
  twitter_handle: twitterHandleGenerator,

  // ── HR & Organization ──────────────────────────────────
  employment_status: employmentStatusGenerator,
  seniority_level: seniorityLevelGenerator,
  skill: skillGenerator,
  leave_type: leaveTypeGenerator,
  employee_id: employeeIdGenerator,
  salary: salaryGenerator,
  team_name: teamNameGenerator,
  degree: degreeGenerator,
  university_name: universityNameGenerator,

  // ── AI / ML ────────────────────────────────────────────
  label: labelGenerator,
  confidence_score: confidenceScoreGenerator,
  token_count: tokenCountGenerator,

  // ── Healthcare ─────────────────────────────────────────
  medical_specialty: medicalSpecialtyGenerator,
  allergy: allergyGenerator,

  // ── Real Estate ────────────────────────────────────────
  property_type: propertyTypeGenerator,

  // ── Media ──────────────────────────────────────────────
  music_genre: musicGenreGenerator,
  color_rgb: colorRgbGenerator,
  color_name: colorNameGenerator,

  // ── Security & Auth ────────────────────────────────────
  password_hash: passwordHashGenerator,
  xss_string: xssStringGenerator,
  sql_injection_string: sqlInjectionStringGenerator,
  role: (params, ctx) => {
    const values = (params.values as string[]) ?? [
      "admin", "editor", "viewer", "moderator", "billing_admin",
      "super_admin", "member", "guest", "owner", "developer",
    ];
    return ctx.prng.pick(values);
  },
  permission: (params, ctx) => {
    const resources = ["users", "posts", "orders", "billing", "settings", "analytics", "admin", "files", "teams", "api_keys"];
    const actions = ["read", "write", "delete", "manage", "create", "update"];
    return `${ctx.prng.pick(resources)}:${ctx.prng.pick(actions)}`;
  },
  oauth_scope: (_params, ctx) => {
    const scopes = [
      "openid", "profile", "email", "read:user", "write:user",
      "read:repos", "write:repos", "admin:org", "read:org",
      "read:packages", "delete:packages", "repo", "gist",
      "notifications", "user:follow", "read:discussion",
    ];
    const count = ctx.prng.nextInt(1, 4);
    const picked = ctx.prng.shuffle([...scopes]).slice(0, count);
    return picked.join(" ");
  },
  license_key: licenseKeyGenerator,
  totp_secret: totpSecretGenerator,
  jwt_token: jwtTokenGenerator,

  // ── Chaos Testing ──────────────────────────────────────
  unicode_string: unicodeStringGenerator,
  long_string: longStringGenerator,
  boundary_integer: boundaryIntegerGenerator,
  empty_string: emptyStringGenerator,
  error_value: errorValueGenerator,
  future_proof_date: futureProofDateGenerator,

  // ── Logic ──────────────────────────────────────────────
  boolean: booleanGenerator,
  enum: enumGenerator,
  integer: integerGenerator,
  ref: refGenerator,
  sequence: sequenceGenerator,
  constant: constantGenerator,

  // ── Stubs ──────────────────────────────────────────────
  nullable: (_params, _ctx) => null, // Handled in generator.ts
  iban: (_params, ctx) => {
    // Locale-aware IBAN: country prefix + check digits + BBAN (country-specific length)
    const ibanFormats: Record<string, { prefix: string; bbanLength: number }> = {
      de: { prefix: "DE", bbanLength: 20 },
      fr: { prefix: "FR", bbanLength: 25 },
      es: { prefix: "ES", bbanLength: 22 },
      it: { prefix: "IT", bbanLength: 25 },
      nl: { prefix: "NL", bbanLength: 14 },
      pt: { prefix: "PT", bbanLength: 23 },
      pl: { prefix: "PL", bbanLength: 24 },
      se: { prefix: "SE", bbanLength: 22 },
      da: { prefix: "DK", bbanLength: 16 },
      nb: { prefix: "NO", bbanLength: 13 },
      hr: { prefix: "HR", bbanLength: 19 },
      en: { prefix: "GB", bbanLength: 18 },
      ar: { prefix: "SA", bbanLength: 22 },
      tr: { prefix: "TR", bbanLength: 24 },
    };
    const format = ibanFormats[ctx.locale] ?? ibanFormats.de;
    const checkDigits = String(ctx.prng.nextInt(10, 99));
    const bban = Array.from({ length: format.bbanLength }, () => ctx.prng.nextInt(0, 9)).join("");
    return `${format.prefix}${checkDigits}${bban}`;
  },
  vat_number: (_params, ctx) => {
    // Locale-aware VAT number
    const vatPrefixes: Record<string, string> = {
      de: "DE", fr: "FR", es: "ES", it: "IT", nl: "NL", pt: "PT",
      pl: "PL", se: "SE", da: "DK", nb: "NO", hr: "HR", en: "GB",
    };
    const prefix = vatPrefixes[ctx.locale] ?? "DE";
    return `${prefix}${ctx.prng.nextInt(100000000, 999999999)}`;
  },
};
