// ===== QORVAN E-Commerce & CMS Module & Permission Definitions =====

export const CMS_MODULES = [
  "dashboard",
  "products",
  "categories",
  "collections",
  "brands",
  "inventory",
  "orders",
  "customers",
  "coupons",
  "delivery-zones",
  "reviews",
  "return-requests",
  "blog",
  "homepage-cms",
  "reports",
  "contact-messages",
  "media",
  "settings",
  "users",
  "subscribers",
] as const;

export type CmsModule = (typeof CMS_MODULES)[number];

export const CMS_ACTIONS = [
  "read",
  "create",
  "update",
  "delete",
  "publish",
  "unpublish",
  "export",
] as const;

export type CmsAction = (typeof CMS_ACTIONS)[number];

export const SUPER_ADMIN_ONLY_MODULES: CmsModule[] = [];

// Human-readable labels for dashboard sidebar navigation
export const MODULE_LABELS: Record<CmsModule, string> = {
  dashboard: "Overview",
  products: "Products",
  categories: "Categories",
  collections: "Collections",
  brands: "Brands",
  inventory: "Inventory",
  orders: "Orders",
  customers: "Customers",
  coupons: "Coupons",
  "delivery-zones": "Delivery Zones",
  reviews: "Product Reviews",
  "return-requests": "Return Requests",
  blog: "Blog Posts",
  "homepage-cms": "Homepage CMS",
  reports: "Sales Reports",
  "contact-messages": "Contact Messages",
  media: "Media Library",
  settings: "Settings",
  users: "Users",
  subscribers: "Subscribers",
};

// Sidebar route mapping
export const MODULE_ROUTES: Record<CmsModule, string> = {
  dashboard: "/dashboard",
  products: "/dashboard/products",
  categories: "/dashboard/categories",
  collections: "/dashboard/collections",
  brands: "/dashboard/brands",
  inventory: "/dashboard/inventory",
  orders: "/dashboard/orders",
  customers: "/dashboard/customers",
  coupons: "/dashboard/coupons",
  "delivery-zones": "/dashboard/delivery-zones",
  reviews: "/dashboard/reviews",
  "return-requests": "/dashboard/return-requests",
  blog: "/dashboard/blog",
  "homepage-cms": "/dashboard/homepage-cms",
  reports: "/dashboard/reports",
  "contact-messages": "/dashboard/contact-messages",
  media: "/dashboard/media",
  settings: "/dashboard/settings",
  users: "/dashboard/users",
  subscribers: "/dashboard/subscribers",
};

export const DASHBOARD_INVENTORY_VIEW = "dashboard:inventory:read";
export const DASHBOARD_INVENTORY_UPDATE = "dashboard:inventory:update";
export const DASHBOARD_EMAIL_SEND = "dashboard:email:create";
export const DASHBOARD_ORDERS_VIEW = "dashboard:orders:read";
export const DASHBOARD_SETTINGS_MANAGE = "dashboard:settings:update";
