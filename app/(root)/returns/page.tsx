import { getCustomPage } from "@/lib/actions/page.actions";
import ReturnsClient from "./ReturnsClient";

export const dynamic = "force-dynamic";

export default async function ReturnsPage() {
  const res = await getCustomPage("returns");
  const page = res.data;

  return <ReturnsClient page={page} />;
}
