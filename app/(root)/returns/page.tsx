import { Metadata } from "next";
import { getCustomPage } from "@/lib/actions/page.actions";
import ReturnsClient from "./ReturnsClient";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://qorvan.com";
  const title = "Return & Exchange Policy | QORVAN 7-Day Guarantee";
  const description = "QORVAN 7-day hassle-free exchange and returns policy. Learn how to return or exchange luxury tie sets, leather wallets, belts, and formal items.";

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/returns`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/returns`,
      siteName: "QORVAN",
      images: [`${baseUrl}/assets/images/og-cover.webp`],
      type: "website",
    },
  };
}

export default async function ReturnsPage() {
  const res = await getCustomPage("returns");
  const page = res.data;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://qorvan.com";

  const returnPolicyJsonLd = {
    "@context": "https://schema.org",
    "@type": "MerchantReturnPolicy",
    name: "QORVAN Return & Exchange Policy",
    applicableCountry: "BD",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 7,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/FreeReturn",
    url: `${baseUrl}/returns`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(returnPolicyJsonLd) }}
      />
      <ReturnsClient page={page} />
    </>
  );
}

