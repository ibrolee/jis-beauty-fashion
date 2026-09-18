/**
 * JIS Beauty & Fashion — Database schema (PostgreSQL via Drizzle ORM)
 *
 * Money: all amounts are stored as INTEGER NAIRA (₦). Paystack expects kobo,
 * so the Paystack provider multiplies by 100 (see src/lib/payments/paystack.ts).
 *
 * Apply schema changes with:  npx drizzle-kit push
 * Seed demo data with:        npm run db:seed
 */
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

/* -------------------------------------------------------------------------- */
/*                                   Enums                                    */
/* -------------------------------------------------------------------------- */

export const userRoleEnum = pgEnum("user_role", ["customer", "admin"]);

export const productGenderEnum = pgEnum("product_gender", [
  "women",
  "men",
  "unisex",
  "kids",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "payment_confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "paystack",
  "bank_transfer",
  "pay_on_delivery",
]);

export const couponTypeEnum = pgEnum("coupon_type", ["percentage", "fixed"]);

export const reviewStatusEnum = pgEnum("review_status", ["published", "hidden"]);

/* -------------------------------------------------------------------------- */
/*                                   Users                                    */
/* -------------------------------------------------------------------------- */

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    phone: varchar("phone", { length: 30 }),
    whatsapp: varchar("whatsapp", { length: 30 }),
    role: userRoleEnum("role").notNull().default("customer"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)],
);

/** Server-side sessions (httpOnly cookie holds the opaque token). */
export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    token: varchar("token", { length: 128 }).notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("sessions_token_idx").on(t.token), index("sessions_user_idx").on(t.userId)],
);

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 128 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("password_reset_token_idx").on(t.tokenHash)],
);

export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 60 }).notNull().default("Home"),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 30 }).notNull(),
  state: varchar("state", { length: 60 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  addressLine: text("address_line").notNull(),
  instructions: text("instructions"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* -------------------------------------------------------------------------- */
/*                                  Catalog                                   */
/* -------------------------------------------------------------------------- */

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull(),
    description: text("description"),
    image: text("image"),
    /** Self reference allows nested categories (e.g. Beauty > Skincare) later. */
    parentId: integer("parent_id").references((): AnyPgColumn => categories.id, {
      onDelete: "set null",
    }),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("categories_slug_idx").on(t.slug)],
);

export const brands = pgTable(
  "brands",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull(),
  },
  (t) => [uniqueIndex("brands_slug_idx").on(t.slug)],
);

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 220 }).notNull(),
    sku: varchar("sku", { length: 60 }).notNull(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    brandId: integer("brand_id").references(() => brands.id, { onDelete: "set null" }),
    shortDescription: varchar("short_description", { length: 300 }),
    description: text("description").notNull(),
    /** Regular price in ₦ */
    price: integer("price").notNull(),
    /** Discounted price in ₦ (null when not on sale) */
    salePrice: integer("sale_price"),
    stock: integer("stock").notNull().default(0),
    /** Array of image URLs/paths — first image is the primary image */
    images: jsonb("images").$type<string[]>().notNull().default([]),
    gender: productGenderEnum("gender").notNull().default("unisex"),
    /* Fragrance-specific attributes (nullable so non-fragrance products work too) */
    fragranceType: varchar("fragrance_type", { length: 80 }),
    volume: varchar("volume", { length: 40 }),
    topNotes: text("top_notes"),
    heartNotes: text("heart_notes"),
    baseNotes: text("base_notes"),
    longevity: varchar("longevity", { length: 80 }),
    occasion: varchar("occasion", { length: 120 }),
    /* Aggregates (denormalised for fast listing/sorting) */
    rating: real("rating").notNull().default(0),
    reviewCount: integer("review_count").notNull().default(0),
    salesCount: integer("sales_count").notNull().default(0),
    /* Merchandising flags */
    isFeatured: boolean("is_featured").notNull().default(false),
    isBestSeller: boolean("is_best_seller").notNull().default(false),
    isNewArrival: boolean("is_new_arrival").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    /* SEO */
    metaTitle: varchar("meta_title", { length: 160 }),
    metaDescription: varchar("meta_description", { length: 320 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("products_slug_idx").on(t.slug),
    uniqueIndex("products_sku_idx").on(t.sku),
    index("products_category_idx").on(t.categoryId),
    index("products_gender_idx").on(t.gender),
  ],
);

/** Optional size/volume variants, e.g. 50ml / 100ml. */
export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 80 }).notNull(),
  sku: varchar("sku", { length: 60 }),
  price: integer("price").notNull(),
  salePrice: integer("sale_price"),
  stock: integer("stock").notNull().default(0),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

/* -------------------------------------------------------------------------- */
/*                                   Orders                                   */
/* -------------------------------------------------------------------------- */

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    orderNumber: varchar("order_number", { length: 40 }).notNull(),
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    /* Customer */
    email: varchar("email", { length: 255 }).notNull(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    phone: varchar("phone", { length: 30 }).notNull(),
    whatsapp: varchar("whatsapp", { length: 30 }),
    /* Delivery */
    state: varchar("state", { length: 60 }).notNull(),
    city: varchar("city", { length: 100 }).notNull(),
    address: text("address").notNull(),
    instructions: text("instructions"),
    /* Money (₦) */
    subtotal: integer("subtotal").notNull(),
    discount: integer("discount").notNull().default(0),
    deliveryFee: integer("delivery_fee").notNull().default(0),
    total: integer("total").notNull(),
    couponCode: varchar("coupon_code", { length: 40 }),
    /* Status */
    paymentMethod: paymentMethodEnum("payment_method").notNull(),
    paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
    status: orderStatusEnum("status").notNull().default("pending"),
    adminNotes: text("admin_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("orders_number_idx").on(t.orderNumber),
    index("orders_user_idx").on(t.userId),
    index("orders_email_idx").on(t.email),
  ],
);

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id, { onDelete: "set null" }),
  variantId: integer("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
  /* Snapshot of the product at purchase time */
  name: varchar("name", { length: 200 }).notNull(),
  variantName: varchar("variant_name", { length: 80 }),
  sku: varchar("sku", { length: 60 }),
  image: text("image"),
  unitPrice: integer("unit_price").notNull(),
  quantity: integer("quantity").notNull(),
  lineTotal: integer("line_total").notNull(),
});

export const payments = pgTable(
  "payments",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    /** "paystack" | "manual" — see src/lib/payments */
    provider: varchar("provider", { length: 40 }).notNull(),
    reference: varchar("reference", { length: 100 }).notNull(),
    amount: integer("amount").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("NGN"),
    status: paymentStatusEnum("status").notNull().default("pending"),
    channel: varchar("channel", { length: 40 }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    /** Raw provider payload for auditing */
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("payments_reference_idx").on(t.reference), index("payments_order_idx").on(t.orderId)],
);

/* -------------------------------------------------------------------------- */
/*                                  Coupons                                   */
/* -------------------------------------------------------------------------- */

export const coupons = pgTable(
  "coupons",
  {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 40 }).notNull(),
    type: couponTypeEnum("type").notNull(),
    /** Percentage (e.g. 5 = 5%) or fixed ₦ amount depending on `type` */
    value: integer("value").notNull(),
    minOrderAmount: integer("min_order_amount").notNull().default(0),
    /** Cap for percentage discounts (₦). Null = no cap */
    maxDiscount: integer("max_discount"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    usageLimit: integer("usage_limit"),
    usedCount: integer("used_count").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    description: varchar("description", { length: 200 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("coupons_code_idx").on(t.code)],
);

/* -------------------------------------------------------------------------- */
/*                             Reviews & Wishlists                            */
/* -------------------------------------------------------------------------- */

export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    title: varchar("title", { length: 150 }),
    comment: text("comment").notNull(),
    status: reviewStatusEnum("status").notNull().default("published"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("reviews_product_idx").on(t.productId)],
);

export const wishlists = pgTable(
  "wishlists",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("wishlists_user_product_idx").on(t.userId, t.productId)],
);

/* -------------------------------------------------------------------------- */
/*                          Marketing & site content                          */
/* -------------------------------------------------------------------------- */

export const newsletterSubscribers = pgTable(
  "newsletter_subscribers",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("newsletter_email_idx").on(t.email)],
);

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  subject: varchar("subject", { length: 200 }),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Key/value store for admin-editable homepage & site content. */
export const siteSettings = pgTable("site_settings", {
  key: varchar("key", { length: 80 }).primaryKey(),
  value: jsonb("value").$type<Record<string, unknown>>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* -------------------------------------------------------------------------- */
/*                                 Relations                                  */
/* -------------------------------------------------------------------------- */

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  addresses: many(addresses),
  reviews: many(reviews),
  wishlists: many(wishlists),
}));

export const categoriesRelations = relations(categories, ({ many, one }) => ({
  products: many(products),
  parent: one(categories, { fields: [categories.parentId], references: [categories.id] }),
}));

export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  brand: one(brands, { fields: [products.brandId], references: [brands.id] }),
  variants: many(productVariants),
  reviews: many(reviews),
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
  payments: many(payments),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
}));

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, { fields: [wishlists.userId], references: [users.id] }),
  product: one(products, { fields: [wishlists.productId], references: [products.id] }),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, { fields: [addresses.userId], references: [users.id] }),
}));

/* -------------------------------------------------------------------------- */
/*                               Inferred types                               */
/* -------------------------------------------------------------------------- */

export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Brand = typeof brands.$inferSelect;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductVariant = typeof productVariants.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Address = typeof addresses.$inferSelect;
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];
export type PaymentMethod = (typeof paymentMethodEnum.enumValues)[number];
export type ProductGender = (typeof productGenderEnum.enumValues)[number];
