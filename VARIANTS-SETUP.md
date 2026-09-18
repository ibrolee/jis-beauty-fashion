# JIS Beauty & Fashion — Old website variant upgrade

This is the **original uploaded storefront**, not the rebuilt `jisbeauty-new-website` project. No live database, Vercel project, domain, or GitHub repository was changed by preparing this ZIP.

## What was changed

- Admin → Products → Add/Edit now offers individual options for scents, sizes, or colours. Every option has its own name, optional SKU, price, optional sale price, stock and photos. Up to 40 options, 12 photos each.
- Storefront product photos switch when a customer chooses an option, including its thumbnail gallery. Variant price and stock already switched in the old site and still do.
- The selected variant's image, name, price, and stock are carried into the cart and verified at checkout. Historical order references survive future edits because existing options keep their database IDs. Removing an option archives it and sets its stock to zero.
- Storefront products with options calculate parent stock from active options when saved. Checkout uses atomic stock deductions to avoid concurrent overselling.
- Supabase Storage is an **optional** admin-photo backend; Vercel Blob remains available. No Supabase Auth rewrite is required: the old site already uses PostgreSQL + Drizzle + its own session-based user accounts.
- Demo inventory is no longer silently populated when the database is empty; `ENABLE_DEMO_SEED=true` is preview-only.

## Stop: safeguard the live site

1. Keep the currently working Vercel project and domain untouched. Make a **full backup of the old site's PostgreSQL database** before migrating or changing DATABASE_URL. A GitHub ZIP does *not* include live products, users, passwords, orders or the database.
2. Deploy this ZIP to a **separate preview project** first, with a copy of your existing database, not production DB. Do not point two divergent site versions at the same production DB while testing.
3. Inspect the old Vercel project's `DATABASE_URL` privately; its code already **requires PostgreSQL**. If you want to use Supabase, you can point it to a **separate, fully migrated Supabase PostgreSQL database** after moving existing data. Do **not** point the old site at the unfinished new site's Supabase database: their schemas differ.
4. Use a staging database with the old site's full schema. Do not run `db:push` on production without a backup and reviewing generated schema changes.

## Apply additive database migration to a COPY first

In your existing PostgreSQL database (or its migrated Supabase copy), open the SQL editor and run `migrations/001_variant_photos.sql`. It only adds two columns to `product_variants` and doesn't touch orders or admin accounts. If the database is totally new, provision the **entire original schema** with `npx drizzle-kit push` against an empty *staging* database first, then seed only if intentionally using demo content. The Drizzle config now reads `DATABASE_URL` from the environment rather than using a hardcoded localhost address.

## Product-photo uploads: choose ONE provider

**Existing Vercel Blob:** if uploads already work, retain its `Images_STORE_ID` setting. This continues to take priority.

**Supabase Storage:** in the chosen Supabase project create a **public** bucket named `product-images` (use another name only if setting `SUPABASE_STORAGE_BUCKET`). In your preview Vercel project's Environment Variables set:

- `SUPABASE_URL` = project's URL (server only)
- `SUPABASE_SERVICE_ROLE_KEY` = service-role key (SERVER ONLY, never `NEXT_PUBLIC_`, never share in chat)
- `SUPABASE_STORAGE_BUCKET` = `product-images` (optional default)

If `Images_STORE_ID` is absent, the upload form uses Supabase Storage automatically. Because the original Vercel project already has a Blob store, leave the existing image storage integration alone; you do not need to create Supabase. Photos are public, which is appropriate for storefront product imagery; don't upload private images. Never commit real environment values to GitHub.

For the database, set `DATABASE_URL` to the *appropriate original or fully migrated Supabase PostgreSQL connection string* in preview Vercel, not a Supabase API URL or anon key. If using Supabase pooler, choose its documented pooler URL. `DATABASE_SSL=true` may be required, depending on the provider. Set `ENABLE_DEMO_SEED=false` for any real store.

## Existing database: verified from Vercel screenshots

The original Neon database contains `product_variants` rows for 50ml, 100ml, 6ml and 12ml, with `id`, `product_id`, `name`, `sku`, `price`, `sale_price`, `stock` and `sort_order`. The migration adds **only** `images` and `is_active` (if absent); no existing rows are deleted. Screenshots do not establish a verified backup or a production migration, and the updated website has **not** been deployed.

## Test on preview before publishing

1. In admin, create a **hidden** test product or edit an existing demo. Choose its category and upload its main photo.
2. Under "Product options & individual photos", add `Merlot · 100ml` and `Midnight Exclusive · 100ml`. Set each variant's **actual price, actual individual stock, and corresponding photo**. Do not invent a split of combined stock: total stock `2` needs clarification before dividing between scents.
3. Save, open its preview, switch options, check that photo, price and stock switch. Add each option to the cart and check its image, label and price, then use a test checkout without real payments.
4. Test editing, removing (archiving), and cancelling a test order to confirm inventory handling.
5. Only after verification, deploy to the original site's production project. Keep a rollback deployment and database backup.

**Important:** This archive is a code update, not an actual database or hosted deployment. No live site changes have been made. An npm install/typecheck/build still needs to run in an environment with dependencies available; it could not be completed in this offline workspace.
