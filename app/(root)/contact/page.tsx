import { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { getSetting } from "@/lib/actions/setting.actions";
import ContactForm from "./ContactForm";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Contact Us | Qorvan",
  description: "Get in touch with us for inquiries, partnerships, or support.",
};

export default async function ContactPage() {
  const setting = (await getSetting()) || ({} as any);

  return (
    <div>
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
