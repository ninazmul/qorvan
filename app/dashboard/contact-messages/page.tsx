import { getContactMessages } from "@/lib/actions/contact.actions";
import { requirePermission } from "@/lib/auth/rbac";
import ContactClient from "./ContactClient";

export const dynamic = "force-dynamic";

export default async function ContactMessagesDashboardPage() {
  const access = await requirePermission("contact-messages", "read");
  const result = await getContactMessages();
  const messages = result.success ? result.data : [];

  return <ContactClient initialMessages={messages} access={access} />;
}
