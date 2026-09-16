/**
 * Editable copy for policy/help pages. Keep legal wording here so it can be
 * reviewed without touching components.
 */
import type { InfoSection } from "@/components/info/info-page";

export const FAQ_ITEMS: { q: string; a: string }[] = [
  { q: "Are your perfumes original?", a: "Yes. Every fragrance we sell is 100% authentic, sourced from authorised distributors and delivered sealed. If you ever have a doubt, message us with your order number and we'll verify the batch." },
  { q: "How long does delivery take?", a: "Lagos orders arrive in 1–2 business days. Abuja, Ogun and Oyo in 2–3 business days, and the rest of Nigeria in 3–5 business days. You'll receive a tracking update on WhatsApp once dispatched." },
  { q: "How much is delivery?", a: "₦2,500 within Lagos, ₦4,000 to Abuja/Ogun/Oyo and ₦4,500 to other states. Delivery is free on orders above ₦150,000." },
  { q: "What payment methods do you accept?", a: "Card, bank transfer and USSD via Paystack, direct bank transfer, and pay-on-delivery within Lagos." },
  { q: "Can I return a perfume?", a: "Unopened, sealed items can be returned within 7 days of delivery. For hygiene reasons we cannot accept opened or used fragrances unless they arrived damaged or incorrect." },
  { q: "How do I use a coupon code?", a: "Enter the code in the discount box in your bag or at checkout and tap Apply. Only one coupon can be used per order." },
  { q: "Do you offer gift wrapping?", a: "Every order is packaged beautifully by default. Add a gift note in the delivery instructions box at checkout and we'll include it — free of charge." },
  { q: "How do perfume oils differ from sprays?", a: "Perfume oils are alcohol-free and more concentrated, so they sit closer to the skin and last longer. They are perfect for layering under a matching spray." },
  { q: "Can I track my order?", a: "Yes — create an account or use the link in your confirmation email to see live status updates from Pending to Delivered." },
];

export const SHIPPING_SECTIONS: InfoSection[] = [
  { title: "Delivery timelines", body: ["Orders placed before 2pm (Mon–Sat) are dispatched the same day. Lagos deliveries arrive within 1–2 business days; Abuja, Ogun and Oyo within 2–3 business days; all other states within 3–5 business days.", "Timelines may extend slightly during public holidays, sales periods or severe weather. We'll always keep you updated on WhatsApp."] },
  { title: "Delivery fees", body: ["Lagos: ₦2,500 · Abuja, Ogun & Oyo: ₦4,000 · Other states: ₦4,500.", "Delivery is FREE on all orders above ₦150,000."] },
  { title: "Tracking your order", body: ["You'll receive a confirmation as soon as your order is placed and another message once it ships. Logged-in customers can follow every status change under My Account → Orders."] },
  { title: "Failed deliveries", body: ["Our courier will attempt delivery twice and call the number on the order. If both attempts fail, the package returns to us and a re-delivery fee may apply."] },
  { title: "Pick-up", body: ["Prefer to pick up in Lagos? Message us on WhatsApp after placing your order and we'll arrange a convenient time."] },
];

export const RETURNS_SECTIONS: InfoSection[] = [
  { title: "7-day return window", body: ["Unopened, sealed products in their original packaging can be returned within 7 days of delivery for a refund or exchange."] },
  { title: "What can't be returned", body: ["For hygiene and safety reasons we cannot accept opened, tested or used fragrances, perfume oils or beauty products — unless the item arrived damaged, defective or different from what you ordered."] },
  { title: "Damaged or wrong items", body: ["Please inspect your parcel on arrival. If anything is damaged or incorrect, send photos on WhatsApp within 48 hours of delivery and we'll replace it or refund you in full, including delivery."] },
  { title: "How to start a return", body: ["Message us on WhatsApp (0904 233 6294) or email hello@jisbeauty.ng with your order number and reason. We'll confirm eligibility and share return instructions. Return shipping for change-of-mind returns is covered by the customer."] },
  { title: "Refunds", body: ["Once we receive and inspect the item, refunds are issued to your original payment method (or bank account for transfers) within 5–7 business days."] },
];

export const PRIVACY_SECTIONS: InfoSection[] = [
  { title: "What we collect", body: ["When you shop with us we collect the details needed to process your order: name, email, phone/WhatsApp numbers, delivery address and order history. If you create an account we also store a securely hashed password. Payment card details are handled entirely by our payment processor (Paystack) and never touch our servers."] },
  { title: "How we use it", body: ["To fulfil and deliver your orders, send order updates, respond to enquiries, prevent fraud and — only if you opt in — send occasional newsletters. We do not sell your personal data."] },
  { title: "Cookies", body: ["We use essential cookies to keep you logged in and to remember your bag. No third-party advertising cookies are set by this site."] },
  { title: "Sharing", body: ["Your information is shared only with service providers who help us operate the store — delivery partners, our payment processor and email provider — and only to the extent needed."] },
  { title: "Your rights", body: ["You may request a copy of your data, ask us to correct it, or ask us to delete your account at any time by emailing hello@jisbeauty.ng. We comply with the Nigeria Data Protection Act (NDPA) 2023."] },
];

export const TERMS_SECTIONS: InfoSection[] = [
  { title: "About these terms", body: ["These terms govern purchases from JIS Beauty & Fashion (\"JIS\", \"we\", \"us\"). By placing an order you agree to them."] },
  { title: "Products & pricing", body: ["All prices are in Nigerian Naira (₦) and include applicable taxes. We take care to describe products accurately, but colours and packaging may vary slightly from images. We reserve the right to correct pricing errors and to limit quantities."] },
  { title: "Orders & payment", body: ["An order is confirmed only once payment is received (or, for pay-on-delivery, once we confirm availability). Unpaid bank-transfer orders are held for 24 hours before stock is released."] },
  { title: "Coupons", body: ["Coupon codes are subject to their stated conditions (minimum spend, expiry, usage limits), cannot be combined and have no cash value."] },
  { title: "Delivery & risk", body: ["Delivery timelines are estimates. Risk in the goods passes to you on delivery to the address provided."] },
  { title: "Returns", body: ["Returns are governed by our Returns & Refund Policy."] },
  { title: "Liability", body: ["To the fullest extent permitted by Nigerian law, our liability for any claim relating to an order is limited to the amount paid for that order."] },
  { title: "Contact", body: ["JIS Beauty & Fashion · Lagos, Nigeria · hello@jisbeauty.ng · WhatsApp 0904 233 6294."] },
];
