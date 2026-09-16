# JIS Beauty & Fashion — E-commerce

> *Where beauty meets style.* A production-ready Nigerian beauty & fragrance store built with **Next.js 16 (App Router)**, **PostgreSQL + Drizzle ORM**, **Tailwind CSS v4** and a Paystack-ready payment layer.

## Features

- Storefront: home, shop with filters/sorting/pagination, category pages (`/shop/women`), product pages (`/product/slug`) with variants, notes, reviews, related products, search, wishlist
- Cart (persisted in the browser) with coupon codes (`JISWELCOME` = 5 % off seeded)
- Nigerian checkout (state-based delivery fees, WhatsApp number, guest or logged-in) → real orders in PostgreSQL
- Payments: **Paystack redirect flow + webhook** behind a provider interface; bank transfer & pay-on-delivery as offline methods. No fake success states.
- Customer accounts: register / login / logout / password reset, orders & tracking, profile, addresses
- Admin (`/admin`, role-based): dashboard, products (CRUD + variants + flags), categories, coupons, orders (status/payment updates, stock restore on cancel), customers, reviews moderation, messages/newsletter, homepage content
- SEO: metadata, Open Graph, JSON-LD (Store / Product / FAQ), sitemap, robots, clean slugs
- Accessible, mobile-first UI with elegant serif/sans typography

## Quick start

```bash
cp .env.example .env         # fill in DATABASE_URL etc.
npm install
npm run db:push              # create tables (drizzle-kit push)
npm run db:seed              # demo catalogue, coupons, admin + demo customers
npm run dev
```

Demo data is also seeded automatically on first request if the products table is empty (`src/db/ensure-seed.ts`).

**Seeded accounts**

| Role     | Email                 | Password       |
| -------- | --------------------- | -------------- |
| Admin    | admin@jisbeauty.ng    | Admin@2024     |
| Customer | adaeze@example.com    | Customer@2024  |

Change these via `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` before seeding, or from the admin after login.

## Project structure

```
src/
  app/
    (store)/            storefront routes (home, shop, product, cart, checkout, account, auth, info pages)
    admin/              admin dashboard (protected by role)
    api/                route handlers (coupons, wishlist, products, Paystack callback + webhook, health)
    layout.tsx          root layout, fonts, metadata, providers
    sitemap.ts robots.ts not-found.tsx error.tsx
  components/           UI grouped by domain (layout, product, cart, checkout, account, admin, ui…)
  content/              editable policy/FAQ copy
  db/
    schema.ts           Drizzle schema (users, products, variants, categories, orders, order_items, payments, coupons, reviews, wishlists, addresses, …)
    seed.ts             seed logic · seed-data/catalog.ts demo products
  lib/
    auth/               password hashing (bcrypt), DB sessions, auth server actions
    actions/            server actions: checkout, account, engagement (reviews/contact/newsletter), admin
    data/               read queries (products, categories, orders, coupons, reviews, users, settings)
    payments/           PaymentProvider interface, Paystack implementation, reconciliation service
    email.ts            email adapter (Resend by default; logs when unconfigured)
    storage.ts          image upload adapter (integration point)
    constants.ts        site info, nav, states, delivery fees, labels
    validation.ts       Zod schemas
  types/                shared TS types
```

## Environment variables

See `.env.example`. Key ones:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_SITE_URL` | Public URL (callbacks, emails, sitemap) |
| `AUTH_SECRET` | Random secret for auth |
| `PAYSTACK_SECRET_KEY` | Enables online payments (checkout option appears automatically) |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Only needed if you add Paystack inline/popup later |
| `RESEND_API_KEY`, `EMAIL_FROM` | Transactional email |
| `NEXT_PUBLIC_BANK_*` | Bank details shown for manual transfers |

## Connecting Paystack

1. Set `PAYSTACK_SECRET_KEY` (test key first). The "Pay online" option turns on by itself.
2. In the Paystack dashboard set the webhook URL to `https://<domain>/api/payments/paystack/webhook`.
3. Flow: `placeOrder` → `paystackProvider.initialize` → customer pays → callback `/api/payments/paystack/callback` verifies → order marked **Payment Confirmed**. The webhook is idempotent and acts as the source of truth.

To add another gateway implement `PaymentProvider` in `src/lib/payments/` and register it in `index.ts`.

## Deploying

Any Node host works (Vercel, Railway, Render, Fly). Provision PostgreSQL (Neon/Supabase/RDS), set env vars, run `npm run db:push && npm run db:seed` once, then `npm run build && npm start`.

## Scripts

- `npm run dev` / `build` / `start`
- `npm run db:push` – apply schema
- `npm run db:seed` – seed demo data (`-- --force` to re-run)
- `npm run typecheck` / `npm run lint`
