import { requirePermission } from "@/lib/auth/rbac";
import { getAllReviews } from "@/lib/actions/review.actions";
import ReviewsClient from "./ReviewsClient";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  await requirePermission("reviews", "read");
  const res = await getAllReviews();
  const reviews = res.success ? res.data : [];

  return <ReviewsClient initialReviews={reviews} />;
}
