/** Business policy text. Review delivery, returns and product guarantees with the owner before launch. */
import type { InfoSection } from "@/components/info/info-page";

export const FAQ_ITEMS: { q: string; a: string }[] = [
  { q: "Are your perfumes original?", a: "We aim to sell genuine fragrances sourced from reliable suppliers. If you have any concerns about a particular item, message us with your order number and photos so we can investigate." },
  { q: "How long does delivery take?", a: "Lagos orders are estimated at 1–2 business days. Abuja, Ogun and Oyo at 2–3 business days, and the rest of Nigeria at 3–5 business days. Contact us on WhatsApp if you need an update." },
  { q: "How much is delivery?", a: "₦2,500 within Lagos, ₦4,000 to Abuja/Ogun/Oyo and ₦4,500 to other states. Delivery is free on orders above ₦150,000." },
  { q: "What payment methods do you accept?", a: "At checkout, choose instant payment on WhatsApp to request account details with your order and product links, or choose website bank transfer to see our account number and exact total. We confirm payment only after checking our bank account." },
  { q: "How long is my bank-transfer order reserved?", a: "Six hours from order placement. Make your transfer within that time and select 'I have transferred the amount' on your order page. Orders without a confirmed payment or reported transfer become eligible for automatic cancellation after six hours. If you report a transfer, we hold your order for manual review until we verify payment or contact you. Never transfer to a cancelled order; contact us if you need assistance." },
  { q: "Can I return a perfume?", a: "Unopened, sealed items can be returned within 7 days of delivery. For hygiene reasons we cannot accept opened or used fragrances unless they arrived damaged or incorrect." },
  { q: "How do I use a coupon code?", a: "Enter the code in the discount box in your bag or at checkout and tap Apply. Only one coupon can be used per order." },
  { q: "Do you offer gift wrapping?", a: "Every order is packaged with care. Add a gift note in the delivery instructions box at checkout, or contact us on WhatsApp to discuss gift wrapping." },
  { q: "How do perfume oils differ from sprays?", a: "Perfume oils and sprays have different formulations and application styles. Check the individual product description for details." },
  { q: "Can I track my order?", a: "Save your order number and use the order confirmation page to view its status. Logged-in customers can also check My Account → Orders." },
];

export const SHIPPING_SECTIONS: InfoSection[] = [
  { title: "Delivery timelines", body: ["Orders placed before 2pm (Mon–Sat) are dispatched the same day. Lagos deliveries arrive within 1–2 business days; Abuja, Ogun and Oyo within 2–3 business days; all other states within 3–5 business days.", "Timelines may extend during public holidays, sales periods or severe weather. Message us on WhatsApp if you need an update."] },
  { title: "Delivery fees", body: ["Lagos: ₦2,500 · Abuja, Ogun & Oyo: ₦4,000 · Other states: ₦4,500.", "Delivery is FREE on all orders above ₦150,000."] },
  { title: "Tracking your order", body: ["Keep your confirmation-page link and order number to follow your order's status. Logged-in customers can also check My Account → Orders."] },
  { title: "Failed deliveries", body: ["Our courier will attempt delivery twice and call the number on the order. If both attempts fail, the package returns to us and a re-delivery fee may apply."] },
  { title: "Pick-up", body: ["Prefer to pick up in Lagos? Message us on WhatsApp after placing your order and we'll arrange a convenient time."] },
];

export const RETURNS_SECTIONS: InfoSection[] = [
  { title: "7-day return window", body: ["Unopened, sealed products in their original packaging can be returned within 7 days of delivery for a refund or exchange."] },
  { title: "What can't be returned", body: ["For hygiene and safety reasons we cannot accept opened, tested or used fragrances, perfume oils or beauty products — unless the item arrived damaged, defective or different from what you ordered."] },
  { title: "Damaged or wrong items", body: ["Please inspect your parcel on arrival. If anything is damaged or incorrect, send photos on WhatsApp within 48 hours of delivery and we'll replace it or refund you in full, including delivery."] },
  { title: "How to start a return", body: ["Message us on WhatsApp (0904 233 6294) or use the contact form with your order number and reason. We'll confirm eligibility and share return instructions. Return shipping for change-of-mind returns is covered by the customer."] },
  { title: "Refunds", body: ["Once we receive and inspect the item, refunds are issued to your original payment method (or bank account for transfers) within 5–7 business days."] },
];

export const PRIVACY_SECTIONS: InfoSection[] = [
  { title: "What we collect", body: ["When you shop with us we collect the details needed to process your order: name, email, phone/WhatsApp numbers, delivery address and order history. If you create an account we also store a securely hashed password. Payment card details are handled entirely by our payment processor (if online payments are enabled) and never touch our servers."] },
  { title: "How we use it", body: ["To fulfil and deliver your orders, send order updates when email delivery is available, respond to enquiries, prevent fraud and — only if you opt in — send occasional newsletters. We do not sell your personal data."] },
  { title: "Cookies", body: ["We use essential cookies to keep you logged in and to remember your bag. No third-party advertising cookies are set by this site."] },
  { title: "Sharing", body: ["Your information is shared only with service providers who help us operate the store — delivery partners, our payment processor and email provider — and only to the extent needed."] },
  { title: "Your rights", body: ["You may request a copy of your data, ask us to correct it, or request account deletion using our contact form or WhatsApp number. We process such requests under applicable data-protection requirements."] },
];

export const TERMS_SECTIONS: InfoSection[] = [
  { title: "About these terms", body: ["These terms govern purchases from JIS Beauty & Fashion (\"JIS\", \"we\", \"us\"). By placing an order you agree to them."] },
  { title: "Products & pricing", body: ["All prices are in Nigerian Naira (₦) and include applicable taxes. We take care to describe products accurately, but colours and packaging may vary slightly from images. We reserve the right to correct pricing errors and to limit quantities."] },
  { title: "Orders & payment", body: ["Choose WhatsApp instant payment or website bank transfer at checkout. Placing an order reserves available stock for six hours, but does not confirm payment. For website transfers, pay the exact total and select 'I have transferred the amount' within six hours. We verify money received before marking the order paid and beginning delivery. An unpaid order with no transfer report is eligible for automatic cancellation and stock release after six hours; cancellation may occur later if the scheduled check is delayed. A reported transfer stays pending for manual bank verification, after which we confirm payment or contact you. Never transfer to an already-cancelled order; contact us promptly if you have paid and need help."] },
  { title: "Coupons", body: ["Coupon codes are subject to their stated conditions (minimum spend, expiry, usage limits), cannot be combined and have no cash value."] },
  { title: "Delivery & risk", body: ["Delivery timelines are estimates. Risk in the goods passes to you on delivery to the address provided."] },
  { title: "Returns", body: ["Returns are governed by our Returns & Refund Policy."] },
  { title: "Liability", body: ["To the fullest extent permitted by Nigerian law, our liability for any claim relating to an order is limited to the amount paid for that order."] },
  { title: "Contact", body: ["JIS Beauty & Fashion · Lagos, Nigeria · WhatsApp 0904 233 6294 · Contact form at /contact."] },
];
