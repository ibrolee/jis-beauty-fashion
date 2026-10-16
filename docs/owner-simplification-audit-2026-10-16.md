# JIS Beauty & Fashion: owner usability and website audit
Date: 16 October 2026

## Scope and evidence
Reviewed the deployed `main` source and the staged Stage 5 changes, including the homepage, product and collection routes, cart/checkout/order flow, customer accounts, blog, informational pages, mobile/header/footer navigation, image upload, payment/order administration, website content publishing, and current quality checks.

**Limit:** The public site could not be opened through the available page retrieval tool. This is a source-code and build/test audit, not a claim of a complete visual or authenticated end-to-end browser audit. Changes to actual production content/data were not made.

## Assessment
- **Public storefront:** Already has a coherent premium design system and functional architecture for catalogue, checkout, coupons, product variants, reviews, blog, delivery, account management and order tracking. Another wholesale storefront redesign is not justified without visual/mobile testing and customer behaviour evidence.
- **Owner experience:** The biggest weakness was not visual polish but complexity. The former website editor showed raw field names, many nested sections, image URLs, and unrelated settings on one long page. The owner needs straightforward choices and minimal technical vocabulary.
- **Critical operational verification before any next release:** Sign in as the owner on an isolated preview, edit and save a draft, select and replace a photo, restore a version, quick-edit a product price/stock, and review a payment awaiting transfer confirmation. Do not place live test orders or change production data without a dedicated plan.

## Stage 5 changes in the preview branch
- Task-based editor: Home page, Other pages, Menus, Business details, Delivery & payments, More settings, Previous versions.
- Plain-language labels; advanced options inside expandable sections, all saved content fields retained.
- Replace a single existing photo directly, including from saved media, without first deleting the old photo.
- Simpler Save changes → Preview changes → Publish to website controls; version recovery and draft protection retained.
- Friendly admin navigation labels and regression tests.

## Prioritised follow-ups
1. **Newsletter ownership:** The public signup currently stores email addresses in `newsletter_subscribers`, but the code has no equivalent admin subscriber list, export, unsubscribe workflow, or campaign delivery system. Add subscriber management and consent/unsubscribe controls before sending campaigns. Do not imply that subscribing already sends marketing messages.
2. **Payment review:** Bank transfers use manual verification. Add an owner-friendly prominent list of *reported transfer, awaiting bank verification* with clear next actions; always verify actual bank receipt before marking any order paid.
3. **Authenticated quality assurance:** Test uploads with actual production-equivalent storage and account permissions. Automated tests do not prove that server action save/upload works against the configured database/storage.
4. **Storefront observation:** Visually review real iPhone and desktop renders, loading, image quality, layout, trust/contact information and mobile menu density before planning any wider redesign.
5. **Owner onboarding:** A one-page guide to adding products, replacing photos, checking orders and publishing site changes. Use clear warnings around changing bank details, orders, and delivery prices.

## Release stance
Do not merge or promote Stage 5 automatically. Preserve the prior production deployment for rollback and require a successful preview build plus owner approval.
