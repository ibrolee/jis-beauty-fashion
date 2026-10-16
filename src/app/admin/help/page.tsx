import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { AdminPageHeader } from "@/components/admin/ui";

export const metadata = { title: "How to manage the shop" };

const guides = [
  {
    title: "Add a new product",
    path: "/admin/products/new",
    button: "Add a product",
    steps: ["Enter the product name, price and category.", "Upload at least one clear product photo. Enter the number of items available.", "If it comes in different sizes or scents, add each option and its stock.", "Review the price, then choose Save. Only show it in the shop when it is ready."],
  },
  {
    title: "Change a price or update stock",
    path: "/admin/products",
    button: "Manage products",
    steps: ["Open Products and find the item using its name.", "For a simple item, choose Quick price / stock and save.", "For products with different sizes, choose Edit and update each option separately.", "If stock is running low, open the Low stock filter."],
  },
  {
    title: "Hide a product or bring it back",
    path: "/admin/products?view=archived",
    button: "View hidden products",
    steps: ["Find the item in Products and choose Hide from shop. This does not delete previous orders.", "Open Hidden products to see items that are not currently for sale.", "Check the price and stock before choosing Show in shop again.", "Use Copy product when you want a similar new item — copies start hidden with no stock."],
  },
  {
    title: "Check an order and a bank transfer",
    path: "/admin/payment-review",
    button: "Check payments",
    steps: ["Open Payments to check. A customer reporting a transfer does not mean JIS received money.", "Open the order and note the exact amount and order number.", "Check your real bank account independently. Match the receipt and amount; do not trust screenshots alone.", "Only after the bank confirms the money, change Payment status to Paid on the order and save. Then prepare delivery."],
  },
  {
    title: "Change photos and words on the website",
    path: "/admin/content",
    button: "Edit the website",
    steps: ["Choose Home page, Other pages, Menus, Business details, or Delivery & payments.", "Change only what you need. To replace a photo, tap Change photo or pick a saved photo.", "Tap 1. Save changes. Then 2. Preview changes to check the page.", "When you are happy, tap 3. Publish to website. Previous versions are available if you need to restore one."],
  },
  {
    title: "Update delivery or bank details",
    path: "/admin/content",
    button: "Edit store information",
    steps: ["Open Delivery & payments in the website editor.", "Enter the correct delivery fees, delivery times or bank details.", "Double-check the bank account number and account name before saving.", "Save, preview, and publish. New settings will apply to orders placed after publishing."],
  },
];

export default async function AdminHelpPage() {
  await requireAdmin();
  return <div className="space-y-6">
    <AdminPageHeader title="How to manage your shop" description="Simple instructions for running JIS on your phone. No coding required." />
    <p className="rounded-lg border border-line bg-ivory p-4 text-sm">Choose what you want to do below. Each button opens the right place on your website.</p>
    <div className="grid gap-4 lg:grid-cols-2">
      {guides.map((item) => <section key={item.title} className="rounded-xl border border-line bg-white p-5">
        <h2 className="font-serif text-2xl">{item.title}</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-ink-soft">
          {item.steps.map((step) => <li key={step}>{step}</li>)}
        </ol>
        <Link href={item.path} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-ink px-5 py-2 text-sm font-semibold text-white">{item.button}</Link>
      </section>)}
    </div>
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
      <strong>Important:</strong> Never mark an order paid until the money has actually arrived in your bank. Save website changes as a draft and preview them before publishing.
    </div>
  </div>;
}
