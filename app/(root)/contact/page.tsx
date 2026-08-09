import { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { getSetting } from "@/lib/actions/setting.actions";
import ContactForm from "./ContactForm";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://qorvan.com";
  const title = "Contact Customer Concierge & Atelier Support | QORVAN";
  const description =
    "Get in touch with QORVAN luxury concierge for inquiries, product care guidance, order support, and bespoke partnerships in Bangladesh.";

  return {
    title,
    description,
    keywords: ["Contact QORVAN", "QORVAN Customer Service", "Luxury Fashion Support Bangladesh", "QORVAN Hotline"],
    alternates: {
      canonical: `${baseUrl}/contact`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/contact`,
      siteName: "QORVAN",
      images: [
        {
          url: `${baseUrl}/assets/images/og-cover.webp`,
          width: 1200,
          height: 630,
          alt: "Contact QORVAN Customer Support",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/assets/images/og-cover.webp`],
    },
  };
}

export default async function ContactPage() {
  const setting = (await getSetting()) || ({} as any);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://qorvan.com";

  const contactPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact QORVAN Concierge",
    description: "Contact details for QORVAN luxury fashion house.",
    url: `${baseUrl}/contact`,
    mainEntity: {
      "@type": "Organization",
      name: "QORVAN",
      url: baseUrl,
      email: setting?.contactEmail || "support@qorvan.com",
      telephone: setting?.phoneNumber || "",
      address: setting?.address
        ? {
            "@type": "PostalAddress",
            streetAddress: setting.address,
            addressCountry: "BD",
          }
        : undefined,
    },
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageJsonLd) }}
      />
      <Toaster />
      {/* Page Header */}
      <div className="bg-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold mb-3">Contact Us</h1>
          <p className="text-white max-w-2xl mx-auto">
            We&apos;d love to hear from you. Reach out for inquiries,
            partnerships, or support.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Info */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Get in Touch
            </h2>

            {setting?.contactEmail && (
              <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Mail size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Email
                  </h3>
                  <a
                    href={`mailto:${setting.contactEmail}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {setting.contactEmail}
                  </a>
                </div>
              </div>
            )}

            {setting?.phoneNumber && (
              <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Phone size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Phone
                  </h3>
                  <p className="text-sm text-slate-600">
                    {setting.phoneNumber}
                  </p>
                </div>
              </div>
            )}

            {setting?.address && (
              <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Address
                  </h3>
                  <p className="text-sm text-slate-600">{setting.address}</p>
                </div>
              </div>
            )}

            {setting?.officeHours && (
              <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Clock size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Office Hours
                  </h3>
                  <p className="text-sm text-slate-600">
                    {setting.officeHours}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Send Us a Message
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Fill out the form below and we&apos;ll respond as soon as
              possible.
            </p>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
