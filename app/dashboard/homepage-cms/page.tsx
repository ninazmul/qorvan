import { getHeroSlides } from "@/lib/actions/hero.actions";
import { getAllCustomPages } from "@/lib/actions/page.actions";
import { requirePermission } from "@/lib/auth/rbac";
import HomepageCmsClient from "./HomepageCmsClient";

export const dynamic = "force-dynamic";

export default async function HomepageCmsPage() {
  await requirePermission("homepage-cms", "read");
  const [heroRes, pagesRes] = await Promise.all([
    getHeroSlides(),
    getAllCustomPages(),
  ]);

  const slides = heroRes.success ? heroRes.data : [];
  const customPages: Record<string, any> = pagesRes.success ? pagesRes.data ?? {} : {};

  return <HomepageCmsClient initialSlides={slides} initialCustomPages={customPages} />;
}
