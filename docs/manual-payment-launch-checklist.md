# JIS Beauty & Fashion — manual-payment release handover

**Release candidate branch:** `launch-prep-no-deploy`. **Do not merge, deploy, change production data, or place test orders until the owner explicitly approves.** The branch disables its Vercel preview deployment in `vercel.json`. The existing production branch is `main`.

## Implemented and code-checked (19 September 2026)

- Checkout displays only **Instant payment on WhatsApp** and **Bank transfer on this website**. Both reserve stock and create an unpaid order with server-calculated prices, discount and delivery.
- WhatsApp handoff includes the order reference, names and variants, quantities, product links, exact grand total, and order-page link. If WhatsApp does not open, the customer can retrieve the order via the confirmation link, subject to email delivery being configured and working.
- Website transfer displays the owner-provided **GTBank · 0172349956 · Alli Ibrahim Olanrewaju**, the exact amount and deadline. The customer button only records `payments.metadata.transferReportedAt`. Neither this button nor a WhatsApp handoff marks payment as Paid.
- The admin orders list highlights reports that need verification; the order detail shows the original payment channel. The admin status form refuses to start preparation, shipping or delivery unless Paid is selected. **Only select Paid after confirming actual receipt in the bank account.**
- WhatsApp uses `payments.channel = whatsapp` and website transfer uses `payments.channel = bank_transfer`. Both retain the existing `orders.paymentMethod = bank_transfer` database enum, avoiding schema migrations. The order page and order details distinguish the two, including older website-transfer records.
- Unpaid orders without a reported transfer become eligible for cancellation after six hours. A guarded transaction restores reserved inventory and coupon usage once. **Reported transfers are held for manual verification instead of automatically cancelled**; the admin must confirm payment or cancel after checking. A report is not evidence that money arrived.
- Existing Paystack/pay-on-delivery orders remain readable; those options are no longer offered in checkout. The Vercel build command is `npm run build` and does not run `db:push` or `db:seed`.
- **Code checks:** GitHub `JIS prelaunch audit` TypeScript and ESLint succeeded on commit `fd92522766814ae77adb3567b99fd0e725d57a7c` (the last application-code commit). The isolated `JIS manual payment tests` succeeded on commit `191cc1b4cdbc4539133525be28cfce143d144bb0`: 6 tests for checkout channel, report status, fulfillment guard, six-hour deadline, WhatsApp message, and source safety contracts. These checks do not contact the database or place orders.
- **Database compatibility:** read-only Neon schema inspection confirmed existing `orders.payment_method`, `orders.payment_status`, `orders.status`, `payments.channel`, `payments.metadata` (JSONB), and order-item references are present. No schema change or data mutation was performed by this audit.

## Required owner setup BEFORE approved production deployment

1. Generate one long, random value locally. In **Vercel → JIS project → Settings → Environment Variables**, set `CRON_SECRET` for **Production**. Do not paste the value into this chat, GitHub source code, an issue, or a log. A deployment is required before newly added environment variables become available to its functions.
2. In **GitHub → ibrolee/jis-beauty-fashion → Settings → Secrets and variables → Actions → New repository secret**, set `CRON_SECRET` to **the same value**. The connected tools here do not expose either secret or allow me to verify that it is installed; the owner must confirm setup in the two dashboards.
3. Before launch, personally verify the displayed GTBank recipient and account number in the code match the intended collection account. Confirm the Vercel deployment limit has reset; the reset time has not been independently verified.

## Scheduler details and limitation

- After the approved merge into default branch `main`, `.github/workflows/expire-bank-transfers.yml` requests the authenticated cleanup endpoint at UTC minutes **07, 22, 37 and 52**. GitHub scheduled jobs can run late or be dropped. The existing Vercel **daily** cron remains a fallback, and checkout/order/admin page requests also trigger cleanup.
- Six hours is the **expiry eligibility time**, not a guaranteed exact cancellation moment. We cannot promise minute-exact cancellation on this scheduler. Reported transfers are explicitly excluded until an admin reviews them.
- The endpoint rejects requests without the configured `CRON_SECRET` with HTTP 401. After deployment, use GitHub Actions → Expire overdue JIS orders → Run workflow and verify it succeeds without exposing the secret. Inspect Vercel logs if it fails.

## Hold point: verification possible ONLY after an approved deploy or isolated test environment

1. Confirm that the two-option checkout looks and works on mobile; WhatsApp opens with real product links and exact, server-calculated totals. Ensure the return-to-order link works.
2. Check the on-site bank details and exact total; pressing “I have transferred” must show **awaiting verification**, never Paid. Check the admin report appears and the order stays pending.
3. Verify an unpaid/unreported test reservation crosses six hours and releases stock/coupon only once. Verify a reported-before-deadline reservation stays pending until review. Confirm retries, concurrent expiry versus report, and deadline boundary using **isolated test data only**.
4. After confirming actual bank receipt for an authorized test, admin sets Paid; an unpaid order must be rejected if advanced to processing or shipped. Test cancellation/refund handling separately.
5. Check old Paystack/pay-on-delivery order pages remain usable, image URLs resolve, production public pages pass smoke checks, and cron without authorization returns 401.
6. Do **not** place test orders or payments on the live database without explicit owner authorization. If no isolated database and preview are available, those runtime checks remain unverified until the owner authorizes a controlled production test.

## Release sequence when the owner says to proceed

- Recheck both CI workflows on the **exact final release commit**, branch comparison/mergeability and Vercel deployment limit. Open a review pull request if desired; **do not merge without approval**.
- Owner confirms both secrets and explicitly approves merge/deploy. Merge development branch into `main` only then; check the new Vercel production deployment is Ready and its source commit matches the approved commit.
- Run read-only production smoke checks, then the controlled functional tests above with the owner's explicit authorization. Keep existing customers, orders, inventory and catalog intact. If the build or checks fail, stop and investigate rather than running migrations or seed scripts.

**Not yet demonstrated:** a production/preview build of this release, real browser WhatsApp handoff, database-backed payment/expiry races, Vercel deployment limit status, and existence of both configured scheduler secrets. Green TypeScript/lint/unit checks are not a substitute for these runtime tests.
