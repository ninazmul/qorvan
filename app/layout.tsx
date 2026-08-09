import { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { getSetting } from "@/lib/actions/setting.actions";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-serif",
});

const solaimanLipi = localFont({
  src: [
    {
      path: "../public/fonts/SolaimanLipi.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-bengali",
});

export async function generateMetadata(): Promise<Metadata> {
  const setting = await getSetting();

  const defaultTitle =
    "QORVAN | Luxury Fashion & Leather Goods – Premium Tie Sets, Wallets, Belts & Abayas";
  const defaultDescription =
    "QORVAN is a luxury fashion house offering handcrafted Italian silk tie sets, full-grain leather wallets, executive belts, premium bags, formal shirts, and royal abayas. Cash on Delivery across Bangladesh.";
  const defaultKeywords = [
    "QORVAN",
    "Luxury Fashion Bangladesh",
    "Italian Silk Tie Sets",
    "Full-Grain Leather Wallet",
    "Executive Leather Belt",
    "Premium Bags",
    "Formal Shirts",
    "Royal Abayas",
    "Handcrafted Leather Goods",
    "Cash on Delivery Fashion",
    "Designer Fashion Bangladesh",
  ];
  const defaultUrl = "https://qorvan.com";
  const defaultImage =
    "https://qorvan.com/assets/images/og-cover.webp";

  const seo = setting?.seo || {};
  const metadataBase = seo.canonicalUrlBase
    ? new URL(seo.canonicalUrlBase)
    : new URL(defaultUrl);

  return {
    title: {
      default: seo.siteTitle || defaultTitle,
      template: "%s | QORVAN Luxury Fashion",
    },
    description: seo.siteMetaDescription || defaultDescription,
    keywords: seo.siteKeywords?.length ? seo.siteKeywords : defaultKeywords,
    metadataBase,
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/assets/images/placeholder.webp",
    },
    alternates: {
      canonical: seo.canonicalUrlBase || defaultUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: seo.ogTitle || seo.siteTitle || defaultTitle,
      description:
        seo.ogDescription || seo.siteMetaDescription || defaultDescription,
      url: seo.canonicalUrlBase || defaultUrl,
      siteName: "QORVAN",
      images: seo.ogImage
        ? [
            {
              url: seo.ogImage,
              width: 1200,
              height: 630,
              alt: "QORVAN Luxury Fashion",
            },
          ]
        : [
            {
              url: defaultImage,
              width: 1200,
              height: 630,
              alt: "QORVAN Luxury Fashion",
            },
          ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title:
        seo.twitterCardTitle || seo.ogTitle || seo.siteTitle || defaultTitle,
      description:
        seo.twitterCardDescription ||
        seo.ogDescription ||
        seo.siteMetaDescription ||
        defaultDescription,
      images: seo.twitterCardImage ? [seo.twitterCardImage] : [defaultImage],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const setting = await getSetting();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://qorvan.com";

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "QORVAN",
    url: baseUrl,
    logo: `${baseUrl}/assets/images/og-cover.webp`,
    description:
      "QORVAN is a luxury fashion house offering handcrafted Italian silk tie sets, full-grain leather wallets, executive belts, premium bags, formal shirts, and royal abayas.",
    contactPoint: setting?.phoneNumber || setting?.contactEmail
      ? {
          "@type": "ContactPoint",
          telephone: setting.phoneNumber || "",
          email: setting.contactEmail || "",
          contactType: "customer service",
          areaServed: "BD",
          availableLanguage: ["en", "bn"],
        }
      : undefined,
  };

  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "QORVAN",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/shop?query={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const cssVars = `
    :root {
      --primary: #000000;
      --primary-foreground: #FFFFFF;
    }
  `;

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webSiteJsonLd),
          }}
        />
      </head>
      <style precedence="default" href="qorvan-css-vars">{cssVars}</style>
      <body
        className={`${inter.variable} ${dmSerif.variable} ${solaimanLipi.variable} font-sans`}
      >
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}

