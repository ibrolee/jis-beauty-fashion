import { z } from "zod";
import { NIGERIAN_STATES } from "./constants";

const phone = z
  .string()
  .trim()
  .min(7, "Enter a valid phone number")
  .max(20, "Enter a valid phone number")
  .regex(/^[+\d][\d\s-]{6,}$/, "Enter a valid phone number");

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100);

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "First name is required")
      .max(100),
    lastName: z
      .string()
      .trim()
      .min(2, "Last name is required")
      .max(100),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Enter a valid email address"),
    phone: phone.optional().or(z.literal("")),
    password,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(10),
    password,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name is required")
    .max(100),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name is required")
    .max(100),
  phone: phone.optional().or(z.literal("")),
  whatsapp: phone.optional().or(z.literal("")),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required"),
    password,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const addressSchema = z.object({
  label: z.string().trim().min(1).max(60).default("Home"),
  firstName: z.string().trim().min(2, "First name is required"),
  lastName: z.string().trim().min(2, "Last name is required"),
  phone,
  state: z.enum(NIGERIAN_STATES, {
    message: "Select your state",
  }),
  city: z.string().trim().min(2, "City is required"),
  addressLine: z
    .string()
    .trim()
    .min(5, "Enter your full delivery address"),
  instructions: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal("")),
  isDefault: z.boolean().optional(),
});

export const checkoutSchema = z.object({
  firstName: z.string().trim().min(2, "First name is required"),
  lastName: z.string().trim().min(2, "Last name is required"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address"),
  phone,
  whatsapp: phone.optional().or(z.literal("")),
  state: z.enum(NIGERIAN_STATES, {
    message: "Select your delivery state",
  }),
  city: z.string().trim().min(2, "City is required"),
  address: z
    .string()
    .trim()
    .min(5, "Enter your full delivery address"),
  instructions: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal("")),
  paymentMethod: z.enum([
    "paystack",
    "bank_transfer",
    "pay_on_delivery",
  ]),
  couponCode: z
    .string()
    .trim()
    .toUpperCase()
    .max(40)
    .optional()
    .or(z.literal("")),
  saveAddress: z.boolean().optional(),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        variantId: z.number().int().positive().nullable(),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1, "Your cart is empty"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const reviewSchema = z.object({
  productId: z.coerce.number().int().positive(),
  rating: z.coerce
    .number()
    .int()
    .min(1, "Select a rating")
    .max(5),
  title: z
    .string()
    .trim()
    .max(150)
    .optional()
    .or(z.literal("")),
  comment: z
    .string()
    .trim()
    .min(
      10,
      "Tell us a little more (at least 10 characters)",
    )
    .max(2000),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Your name is required"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address"),
  phone: phone.optional().or(z.literal("")),
  subject: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Please write a short message")
    .max(3000),
});

export const newsletterSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address"),
});

/* ------------------------------- Admin schemas ------------------------------ */

const optionalText = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .or(z.literal(""));

export const productSchema = z.object({
  name: z.string().trim().min(2).max(200),

  slug: z
    .string()
    .trim()
    .max(220)
    .optional()
    .or(z.literal("")),

  /*
   * SKU is optional because the server now generates it
   * automatically when creating a new product.
   */
  sku: z
    .string()
    .trim()
    .max(60)
    .optional()
    .or(z.literal("")),

  categoryId: z.coerce
    .number()
    .int()
    .positive("Select a category"),

  brandName: z
    .string()
    .trim()
    .max(120)
    .optional()
    .or(z.literal("")),

  shortDescription: z
    .string()
    .trim()
    .max(300)
    .optional()
    .or(z.literal("")),

  description: z
    .string()
    .trim()
    .min(10, "Description is required"),

  price: z.coerce.number().int().min(0),

  salePrice: z.coerce
    .number()
    .int()
    .min(0)
    .optional(),

  stock: z.coerce.number().int().min(0),

  images: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  gender: z.enum([
    "women",
    "men",
    "unisex",
    "kids",
  ]),

  fragranceType: optionalText,

  volume: optionalText,

  /*
   * Top notes, heart notes and base notes have intentionally
   * been removed from the admin product form.
   *
   * Existing database columns can remain untouched.
   */

  longevity: optionalText,

  occasion: optionalText,

  isFeatured: z.boolean().optional(),

  isBestSeller: z.boolean().optional(),

  isNewArrival: z.boolean().optional(),

  isActive: z.boolean().optional(),

  metaTitle: z
    .string()
    .trim()
    .max(160)
    .optional()
    .or(z.literal("")),

  metaDescription: z
    .string()
    .trim()
    .max(320)
    .optional()
    .or(z.literal("")),

  /**
   * One variant per line:
   * "50ml | 26500 | 24000 | 20"
   * name | price | salePrice? | stock
   */
  variants: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
});

export const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(3)
    .max(40),

  type: z.enum([
    "percentage",
    "fixed",
  ]),

  value: z.coerce.number().int().min(1),

  minOrderAmount: z
    .coerce
    .number()
    .int()
    .min(0)
    .default(0),

  maxDiscount: z.coerce
    .number()
    .int()
    .min(0)
    .optional(),

  expiresAt: z
    .string()
    .optional()
    .or(z.literal("")),

  usageLimit: z.coerce
    .number()
    .int()
    .min(0)
    .optional(),

  isActive: z.boolean().optional(),

  description: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal("")),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(120),

  slug: z
    .string()
    .trim()
    .max(140)
    .optional()
    .or(z.literal("")),

  description: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal("")),

  image: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal("")),

  sortOrder: z.coerce
    .number()
    .int()
    .default(0),

  isActive: z.boolean().optional(),
});

/** Converts Zod issues into a flat `{ field: message }` map. */
export function fieldErrorsFrom(
  error: z.ZodError,
): Record<string, string> {
  const out: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = String(
      issue.path[0] ?? "form",
    );

    if (!out[key]) {
      out[key] = issue.message;
    }
  }

  return out;
}

/** Reads a FormData into a plain object (checkbox -> boolean). */
export function formToObject(
  formData: FormData,
  booleans: string[] = [],
): Record<string, unknown> {
  const obj: Record<string, unknown> = {};

  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      obj[key] = value;
    }
  }

  for (const b of booleans) {
    obj[b] =
      formData.get(b) === "on" ||
      formData.get(b) === "true";
  }

  return obj;
}