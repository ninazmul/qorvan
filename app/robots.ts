import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://qorvan.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard/",
        "/api/",
        "/sign-in/",
        "/sign-up/",
        "/cart/",
        "/checkout/",
        "/account/",
        "/order/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
