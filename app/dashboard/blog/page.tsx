import { requirePermission } from "@/lib/auth/rbac";
import { getAllBlogPostsAdmin } from "@/lib/actions/blog.actions";
import BlogAdminClient from "./BlogAdminClient";

export const dynamic = "force-dynamic";

export default async function BlogAdminPage() {
  await requirePermission("blog", "read");
  const res = await getAllBlogPostsAdmin();
  const posts = res.success ? res.data : [];

  return <BlogAdminClient initialPosts={posts} />;
}
