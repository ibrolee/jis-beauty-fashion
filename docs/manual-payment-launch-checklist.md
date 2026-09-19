# Manual-payment launch checklist

This branch is **development only**. Do not merge or deploy until approved. Do not use actual customer orders or payment data for tests.

## Checkout channels

- **WhatsApp instant payment:** the customer creates a reserved order and opens WhatsApp with server-calculated order number, total, items, and product links. The `orders.paymentMethod` remains the existing `bank_transfer` enum; the linked `payments.channel` is `whatsapp`. The order page must request payment on WhatsApp and must **not** expose the website's bank-transfer button.
- **Website bank transfer:** `payments.channel` is `bank_transfer`; the order page shows GTBank account **0172349956**, **Alli Ibrahim Olanrewaju**, the exact order total, and a submission button.
- **Customer clicked 'I have transferred':** record `payments.metadata.transferReportedAt` without changing `payments.channel` or marking `orders.paymentStatus` paid. Old records with `payments.channel = transfer_submitted` still count as reports. The admin order page highlights these claims. The administrator checks actual bank receipt before marking Paid and starting fulfillment.
- **Unpaid and unreported:** at six hours the reservation becomes eligible for cancellation, with inventory and coupon usage released once. The expiry query and cancellation transaction both exclude reported transfers to avoid releasing stock for a potentially genuine payment awaiting verification. Reported orders remain pending for manual admin review and must be confirmed paid or explicitly cancelled after review.

## Scheduler configuration REQUIRED before launch

1. In **Vercel → project → Settings → Environment Variables**, add a long, random `CRON_SECRET` for **Production** (do not commit it). Redeploy only after launch approval so the production function receives it.
2. In **GitHub → repository → Settings → Secrets and variables → Actions**, create a repository secret named `CRON_SECRET` with **exactly the same value**. Never place it in the workflow file, an issue, or a chat.
3. After the approved merge, `.github/workflows/expire-bank-transfers.yml` schedules authenticated requests at minutes **07, 22, 37, and 52** of each UTC hour. GitHub scheduled workflows run from the default branch and may be delayed or dropped under load. The existing daily Vercel cron remains a fallback, while the application also checks overdue reservations when customers open checkout or an order and when admins open orders.
4. After production deployment, run the GitHub expiration workflow manually from Actions and confirm that the request succeeds. Check Vercel logs. An unauthenticated request to `/api/cron/expire-bank-transfers` must return `401`. Do **not** expose or paste either secret in test logs.

**Timing limitation:** six hours is the eligibility deadline, not a guaranteed wall-clock cancellation event. The GitHub scheduler is best effort; truly precise six-hour cancellation requires a reliable dedicated queue/scheduler. Never switch `vercel.json` to a sub-daily cron without checking the Vercel plan: Hobby cron is limited to daily frequency.

## Checks before approving production deployment

- GitHub Actions `JIS prelaunch audit` TypeScript and lint jobs both pass on the exact release commit.
- Confirm the WhatsApp message contains accurate order number, server-calculated total, product names, variants, working product links, and the order page link; customer can return to order page if WhatsApp does not open.
- Confirm website transfers display the requested bank account and exact amount and the submission button does not mark an order paid.
- With **isolated test records** only, test deadline boundary, duplicate submissions, a report immediately before cancellation, an unreported overdue cancellation, one-time stock restoration, and admin confirmation. Do not create test orders in the production database without explicit authorization.
- Confirm the admin can distinguish WhatsApp from website transfers and sees a submitted transfer awaiting verification.
- Confirm no production migration, schema push, or seed script can overwrite existing customers, orders, products, or inventory.
