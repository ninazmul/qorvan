"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/database";
import BlogPost from "@/lib/database/models/blog.model";
import { requirePermission } from "@/lib/auth/rbac";

export async function getBlogPosts(query?: { category?: string; tag?: string }) {
  try {
    await connectToDatabase();
    const filter: any = { isPublished: true };
    if (query?.category) filter.category = query.category;
    if (query?.tag) filter.tags = query.tag;

    const posts = await BlogPost.find(filter).sort({ publishedAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(posts)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch blog posts" };
  }
}

export async function getBlogPostBySlug(slug: string) {
  try {
    await connectToDatabase();
    const post = await BlogPost.findOne({ slug, isPublished: true }).lean();
    if (!post) return { success: false, error: "Blog post not found" };
    return { success: true, data: JSON.parse(JSON.stringify(post)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch blog post" };
  }
}

export async function getAllBlogPostsAdmin() {
  await requirePermission("blog", "read");
  try {
    await connectToDatabase();
    const posts = await BlogPost.find().sort({ createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(posts)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch blog posts" };
  }
}

export async function createBlogPost(params: any) {
  await requirePermission("blog", "create");
  try {
    await connectToDatabase();
    const post = await BlogPost.create(params);
    revalidatePath("/blog");
    revalidatePath("/dashboard/blog");
    return { success: true, data: JSON.parse(JSON.stringify(post)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create blog post" };
  }
}

export async function updateBlogPost(id: string, params: any) {
  await requirePermission("blog", "update");
  try {
    await connectToDatabase();
    const updated = await BlogPost.findByIdAndUpdate(id, params, { new: true });
    revalidatePath("/blog");
    revalidatePath(`/blog/${updated?.slug}`);
    revalidatePath("/dashboard/blog");
    return { success: true, data: JSON.parse(JSON.stringify(updated)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update blog post" };
  }
}

export async function deleteBlogPost(id: string) {
  await requirePermission("blog", "delete");
  try {
    await connectToDatabase();
    await BlogPost.findByIdAndDelete(id);
    revalidatePath("/blog");
    revalidatePath("/dashboard/blog");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete blog post" };
  }
}
