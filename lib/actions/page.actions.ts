"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/database";
import CustomPage from "@/lib/database/models/customPage.model";
import { requirePermission } from "@/lib/auth/rbac";

const DEFAULT_PAGES_DATA: Record<string, { title: string; subtitle: string; content: string; sections: { heading: string; body: string }[] }> = {
  about: {
    title: "Executive Elegance, Handcrafted Without Compromise",
    subtitle: "The Craft of QORVAN — Full-grain leather heritage and haute couture tailoring.",
    content: "Founded on the pursuit of perfection, QORVAN represents the peak of luxury fashion, full-grain leather heritage, and executive tailoring.",
    sections: [
      {
        heading: "Full-Grain Leather Heritage",
        body: "Only hand-selected hides are tanned using organic vegetable extracts to form wallets, belts, and executive bags that age gracefully over time.",
      },
      {
        heading: "Italian Pure Silk & Fine Textiles",
        body: "Our neckwear and apparel are crafted in renowned mills with high thread count density, providing superior drape and rich texture.",
      },
      {
        heading: "Executive Concierge Guarantee",
        body: "Nationwide express Cash on Delivery service ensured across all 64 districts in Bangladesh with 100% authenticity guarantees.",
      },
    ],
  },
  privacy: {
    title: "Privacy & Data Protection Policy",
    subtitle: "How QORVAN respects and protects your personal information",
    content: "QORVAN Private Club values your privacy. This policy details how we collect, store, and safeguard your information when visiting our website or purchasing our luxury products.",
    sections: [
      {
        heading: "1. Information We Collect",
        body: "We collect information you provide directly to us when placing an order, subscribing to our newsletter, or contacting customer support, including your name, email address, phone number, and delivery address.",
      },
      {
        heading: "2. How We Use Your Data",
        body: "Your information is used strictly to process orders, deliver products, communicate tracking updates, and send private member invitations if subscribed.",
      },
      {
        heading: "3. Data Security & Storage",
        body: "We implement advanced encryption protocols and enterprise security standards to protect your data against unauthorized access, alteration, or disclosure.",
      },
      {
        heading: "4. Third-Party Services",
        body: "We never sell your personal data. Limited necessary information is shared only with trusted delivery logistics partners to fulfill your orders.",
      },
    ],
  },
  returns: {
    title: "Returns & Exchange Policy",
    subtitle: "Hassle-free 7-day return and exchange guarantee",
    content: "At QORVAN, customer satisfaction is paramount. If you are not completely satisfied with your purchase, we offer easy returns and exchanges within 7 days of delivery.",
    sections: [
      {
        heading: "1. Eligibility for Return",
        body: "Items must be unused, unwashed, with original tags intact and presented in their original luxury packaging within 7 days of receiving your package.",
      },
      {
        heading: "2. Return Process",
        body: "Submit a return request online or contact concierge. Our courier representative will inspect and collect the item from your delivery address.",
      },
      {
        heading: "3. Refunds & Store Credit",
        body: "Once inspected and verified, refunds will be issued to your original payment method or as QORVAN store credit within 3 to 5 business days.",
      },
      {
        heading: "4. Damaged or Incorrect Items",
        body: "In the rare event of receiving a defective or incorrect item, contact our concierge immediately for a complimentary priority exchange.",
      },
    ],
  },
  terms: {
    title: "Terms & Conditions of Service",
    subtitle: "Rules and guidelines for using QORVAN website and purchasing items",
    content: "Welcome to QORVAN. By browsing our platform or placing an order, you agree to comply with and be bound by the following terms and conditions.",
    sections: [
      {
        heading: "1. Product Availability & Pricing",
        body: "All orders are subject to acceptance and availability. Prices are listed in Bangladeshi Taka (BDT ৳) and include applicable taxes unless specified otherwise.",
      },
      {
        heading: "2. Order Placement & Cash on Delivery",
        body: "For Cash on Delivery (COD) orders, full payment must be handed over to the courier representative upon delivery. Inspection before payment is governed by local courier policies.",
      },
      {
        heading: "3. Intellectual Property Rights",
        body: "All trademarks, logos, photography, and brand assets displayed on QORVAN are the exclusive property of QORVAN. Unauthorized reproduction is strictly prohibited.",
      },
      {
        heading: "4. Limitation of Liability",
        body: "QORVAN shall not be liable for indirect or consequential damages arising from website use or delayed delivery due to unforeseen weather or logistical disruptions.",
      },
    ],
  },
};

export async function getCustomPage(slug: "about" | "privacy" | "returns" | "terms") {
  try {
    await connectToDatabase();
    let page = await CustomPage.findOne({ slug }).lean();

    if (!page) {
      const defaultData = DEFAULT_PAGES_DATA[slug];
      if (defaultData) {
        const created = await CustomPage.create({ slug, ...defaultData });
        page = created.toObject();
      }
    }

    return { success: true, data: page ? JSON.parse(JSON.stringify(page)) : null };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch page content" };
  }
}

export async function getAllCustomPages() {
  try {
    await connectToDatabase();
    const slugs = ["about", "privacy", "returns", "terms"] as const;
    const pages: Record<string, any> = {};

    for (const slug of slugs) {
      const res = await getCustomPage(slug);
      if (res.success && res.data) {
        pages[slug] = res.data;
      }
    }

    return { success: true, data: pages };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch all page contents" };
  }
}

export async function updateCustomPage(slug: string, payload: any) {
  await requirePermission("homepage-cms", "update");
  try {
    await connectToDatabase();
    const updated = await CustomPage.findOneAndUpdate(
      { slug },
      { $set: payload },
      { new: true, upsert: true }
    );

    revalidatePath(`/dashboard/homepage-cms`);
    revalidatePath(`/${slug}`);
    if (slug === "returns") revalidatePath("/returns");
    return { success: true, data: JSON.parse(JSON.stringify(updated)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update page content" };
  }
}
