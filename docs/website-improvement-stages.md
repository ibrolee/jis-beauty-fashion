# JIS website improvement stages

Requested by Ibrahim on 16 October 2026. Work proceeds one stage at a time, with a reviewable result at the end of each stage.

## Stage 1 — Foundations

- Keep coupon application separate from order submission, including keyboard use.
- Generate the delivery banner from the same saved thresholds used by checkout, while preserving custom announcements.
- Let the owner edit existing categories, upload category photos, change visibility and reorder categories.
- Use the published category list for both desktop and mobile menus.
- Preserve current delivery prices, payment rules, products and orders. No database migration or seed is needed.

Validation: typecheck, lint, production build, existing commerce regression tests and new interactive coupon/settings tests. Preview verification must identify any gaps requiring authenticated admin access.

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

Stage 1 is being prepared on `improve/jis-stage-1-foundations-2026-10-16`. Stages 2–4 have not started. A preview is a review environment; it does not imply production publication.
