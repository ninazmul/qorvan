import { getHeroSlides } from "@/lib/actions/hero.actions";
import { requirePermission } from "@/lib/auth/rbac";
import HomepageCmsClient from "./HomepageCmsClient";

export const dynamic = "force-dynamic";

export default async function HomepageCmsPage() {
  await requirePermission("homepage-cms", "read");
  const res = await getHeroSlides();
  const slides = res.success ? res.data : [];

  return <HomepageCmsClient initialSlides={slides} />;
}
