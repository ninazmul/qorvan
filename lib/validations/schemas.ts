import { z } from "zod";

// ─── Checkout Form Schema ────────────────────────────────────
export const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z
    .string()
    .min(10, "Valid phone number is required")
    .regex(/^[\d+\-() ]{10,15}$/, "Invalid phone number format"),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  addressLine: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  district: z.string().min(2, "District is required"),
  postalCode: z.string().optional(),
  deliveryZoneId: z.string().min(1, "Please select a delivery zone"),
  notes: z.string().optional(),
  couponCode: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

// ─── Product Form Schema (Admin) ────────────────────────────
export const productSchema = z.object({
  title: z.string().min(3, "Product title is required (min 3 chars)"),
  slug: z
    .string()
    .min(3, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with dashes"),
  description: z.string().min(10, "Description is required (min 10 chars)"),
  shortDescription: z.string().optional(),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  compareAtPrice: z.coerce.number().optional(),
  costPerItem: z.coerce.number().optional(),
  sku: z.string().min(1, "SKU is required"),
  barcode: z.string().optional(),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
  lowStockThreshold: z.coerce.number().min(0).optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  collection: z.string().optional(),
  brand: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["draft", "active", "archived"]),
  isFeatured: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.array(z.string()).optional(),
  specifications: z
    .array(z.object({ key: z.string(), value: z.string() }))
    .optional(),
  careInstructions: z.string().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;

// ─── Coupon Form Schema (Admin) ─────────────────────────────
export const couponSchema = z.object({
  code: z
    .string()
    .min(3, "Coupon code is required")
    .transform((v) => v.toUpperCase()),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.coerce.number().min(1, "Discount value must be > 0"),
  minOrderAmount: z.coerce.number().optional(),
  maxDiscountAmount: z.coerce.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  usageLimit: z.coerce.number().optional(),
  isActive: z.boolean(),
});

export type CouponFormData = z.infer<typeof couponSchema>;

// ─── Category Schema ────────────────────────────────────────
export const categorySchema = z.object({
  name: z.string().min(2, "Category name is required"),
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with dashes"),
  description: z.string().optional(),
  parentId: z.string().optional(),
  isFeatured: z.boolean().optional(),
  order: z.coerce.number().optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

// ─── Delivery Zone Schema ───────────────────────────────────
export const deliveryZoneSchema = z.object({
  name: z.string().min(2, "Zone name is required"),
  locations: z.array(z.string()).min(1, "At least one location is required"),
  baseCharge: z.coerce.number().min(0, "Base charge cannot be negative"),
  freeDeliveryThreshold: z.coerce.number().optional(),
  estimatedDays: z.string().optional(),
  isActive: z.boolean(),
});

export type DeliveryZoneFormData = z.infer<typeof deliveryZoneSchema>;

// ─── Review Schema (Customer) ───────────────────────────────
export const reviewSchema = z.object({
  rating: z.coerce.number().min(1).max(5, "Rating must be 1-5"),
  comment: z.string().min(10, "Please write at least 10 characters"),
  authorName: z.string().min(2, "Name is required"),
  authorEmail: z.string().email("Valid email is required"),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;

// ─── Return Request Schema ──────────────────────────────────
export const returnRequestSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  reason: z.string().min(5, "Please provide a reason"),
  details: z.string().optional(),
});

export type ReturnRequestFormData = z.infer<typeof returnRequestSchema>;
