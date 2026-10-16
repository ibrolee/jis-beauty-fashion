# JIS website improvement stages

Requested by Ibrahim on 16 October 2026. Work proceeds one stage at a time, with a reviewable result at the end of each stage.

## Stage 1 — Foundations

- Keep coupon application separate from order submission, including keyboard use.
- Generate the delivery banner from the same saved thresholds used by checkout, while preserving custom announcements.
- Let the owner edit existing categories, upload category photos, change visibility and reorder categories.
- Use the published category list for both desktop and mobile menus.
- Preserve current delivery prices, payment rules, products and orders. No database migration or seed is needed.

Validation: typecheck, lint, production build, existing commerce regression tests and new interactive coupon/settings tests. Preview verification must identify any gaps requiring authenticated admin access.

Hobby deployment compatibility: Vercel's duplicate expiry cron runs daily at 04:00 UTC. The existing GitHub expiry schedule remains unchanged (`7,22,37,52 * * * *`); its latest inspected run on 16 October succeeded. GitHub schedules can run late. This removes the unsupported 15-minute Vercel schedule that blocked all new deployments on Hobby.

## Stage 2 — Complete content control

- Editable homepage sections, text, images, buttons, order and visibility.
- About, Contact, FAQs, policies, navigation and footer controls.
- Brand and contact settings, with direct image uploads and a shared media manager.
- Draft, preview, publish and restore controls appropriate to the content model.

## Stage 3 — Easier store management

- Clear owner dashboard with direct daily actions.
- Product duplication, quick stock/price updates and recoverable archiving.
- Streamlined order/payment review and useful customer/message tools.
- Check publishing, recovery and image-management workflows on a phone.

## Stage 4 — Storefront refinement

- Shorter homepage with fewer repeated product and newsletter sections.
- More legible logo, consistent product imagery and improved buying information.
- Prioritise populated collections, with owner control over what is shown.
- Stronger business story and responsive customer journey checks.

## Release status

Stage 1 is implemented on `improve/jis-stage-1-foundations-2026-10-16` and has a working preview. Stage 2 is implemented on `improve/jis-stage-2-owner-content-2026-10-16`, stacked on Stage 1. Stages 3–4 have not started. A preview is a review environment; it does not imply production publication.

Stage 2 stores the published snapshot, shared draft, last 15 published versions and media registry in separate keys in the existing `site_settings` table. No schema migration is required. Save, publish, discard and restore operations require an administrator and use a transaction lock plus revision checks to reject stale tabs. Restoring creates a draft; it never publishes immediately. A private preview requires both Next draft mode and a signed-in administrator. Checkout, cart totals and order/payment pages read only published business settings. Blog posts, comments and likes are outside website snapshots and remain independently managed.

Owner entry points: `/admin/content` for website content and publishing; `/admin/media` for reusable images. Removing an image from the media library only hides it from selection, preserving references on pages and in old versions. Product/category/blog photo uploaders use the same picker. Product changes remain in the existing Products screen; easier product management is Stage 3.

Validation: lint, typecheck, production build, 31 existing commerce/Stage 1 checks and 12 Stage 2 publishing/editor tests. Storage tests use an isolated adapter around the real server actions and getters. Authenticated save/upload against the preview database still requires a signed-in owner session; no production content or orders were changed during validation.
