"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/database";
import SeoPage from "@/lib/database/models/seo.model";
import { requirePermission } from "@/lib/auth/rbac";

const DEFAULT_SEO_PAGES = [
  {
    route: "/",
    pageName: "Home Page",
    metaTitle: "QORVAN — Timeless Luxury Fashion & Leather Collections",
    metaDescription: "Discover QORVAN's exclusive handcrafted leather goods, premium executive shirts, and modest fashion collections.",
    keywords: ["Qorvan", "Luxury Fashion", "Leather Goods", "Executive Shirts", "Modest Wear"],
    ogTitle: "QORVAN — Timeless Luxury Fashion",
    ogDescription: "Crafted with precision. Unveil QORVAN's flagship fashion collection.",
    ogImage: "/assets/images/logo.png",
    robotsIndex: true,
    robotsFollow: true,
  },
  {
    route: "/shop",
    pageName: "Shop & Catalog",
    metaTitle: "Shop Luxury Collections | QORVAN",
    metaDescription: "Browse executive leather wallets, belts, formal shirts, and luxury accessories.",
    keywords: ["Qorvan Shop", "Buy Leather Wallets", "Executive Shirts", "Luxury Accessories"],
    ogTitle: "Shop Luxury Collections | QORVAN",
    ogDescription: "Explore our full range of handcrafted luxury apparel and leather goods.",
    ogImage: "/assets/images/logo.png",
    robotsIndex: true,
    robotsFollow: true,
  },
  {
    route: "/blog",
    pageName: "Journal & Stories",
    metaTitle: "Journal & Style Guides | QORVAN",
    metaDescription: "Read exclusive insights on leather craftsmanship, luxury wardrobe styling, and brand stories.",
    keywords: ["Qorvan Journal", "Fashion Blog", "Leather Care Guide", "Luxury Styling"],
    ogTitle: "Journal & Style Guides | QORVAN",
    ogDescription: "Stories of craftsmanship and timeless elegance from QORVAN.",
    ogImage: "/assets/images/logo.png",
    robotsIndex: true,
    robotsFollow: true,
  },
  {
    route: "/contact",
    pageName: "Contact Concierge",
    metaTitle: "Contact Concierge | QORVAN",
    metaDescription: "Get in touch with QORVAN private concierge for inquiries, custom orders, or customer care.",
    keywords: ["Qorvan Contact", "Concierge", "Customer Support"],
    ogTitle: "Contact Concierge | QORVAN",
    ogDescription: "We are here to assist you with bespoke orders and support.",
    ogImage: "/assets/images/logo.png",
    robotsIndex: true,
    robotsFollow: true,
  },
  {
    route: "/about",
    pageName: "Our Craftsmanship Story",
    metaTitle: "Our Craftsmanship Story | QORVAN",
    metaDescription: "Learn about QORVAN's heritage, dedication to premium materials, and sustainable craftsmanship.",
    keywords: ["Qorvan Heritage", "Craftsmanship", "Luxury Leather Manufacturing"],
    ogTitle: "Our Craftsmanship Story | QORVAN",
    ogDescription: "Uncompromising quality and timeless artisan dedication.",
    ogImage: "/assets/images/logo.png",
    robotsIndex: true,
    robotsFollow: true,
  },
];

export async function getAllSeoPages() {
  try {
    await connectToDatabase();
    let pages = await SeoPage.find().sort({ route: 1 }).lean();

    if (pages.length === 0) {
      await SeoPage.insertMany(DEFAULT_SEO_PAGES);
      pages = await SeoPage.find().sort({ route: 1 }).lean();
    }

    return { success: true, data: JSON.parse(JSON.stringify(pages)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch SEO pages" };
  }
}

export async function getSeoPageByRoute(route: string) {
  try {
    await connectToDatabase();
    let page = await SeoPage.findOne({ route }).lean();
    if (!page) {
      const defaultPage = DEFAULT_SEO_PAGES.find((p) => p.route === route);
      if (defaultPage) {
        const created = await SeoPage.create(defaultPage);
        page = created.toObject();
      }
    }
    return { success: true, data: page ? JSON.parse(JSON.stringify(page)) : null };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch SEO page" };
  }
}

export async function updateSeoPage(route: string, payload: any) {
  await requirePermission("settings", "update");
  try {
    await connectToDatabase();
    const updated = await SeoPage.findOneAndUpdate(
      { route },
      { $set: payload },
      { new: true, upsert: true }
    );
    revalidatePath("/dashboard/seo");
    revalidatePath(route);
    return { success: true, data: JSON.parse(JSON.stringify(updated)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update SEO page" };
  }
}
