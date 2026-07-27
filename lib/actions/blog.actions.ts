"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/database";
import BlogPost, { IBlogPost } from "@/lib/database/models/blog.model";
import { requirePermission } from "@/lib/auth/rbac";

export async function getBlogPosts(query?: {
  category?: string;
  tag?: string;
  search?: string;
  limit?: number;
}) {
  try {
    await connectToDatabase();
    const filter: any = { isPublished: true };

    if (query?.category && query.category !== "All") {
      filter.category = query.category;
    }
    if (query?.tag) {
      filter.tags = query.tag;
    }
    if (query?.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: "i" } },
        { excerpt: { $regex: query.search, $options: "i" } },
        { tags: { $in: [new RegExp(query.search, "i")] } },
      ];
    }

    const limit = query?.limit || 20;

    const posts = await BlogPost.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit)
      .lean();

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

    // Fetch 3 related posts from same category or general recent
    const relatedPosts = await BlogPost.find({
      _id: { $ne: post._id },
      isPublished: true,
      category: post.category,
    })
      .limit(3)
      .lean();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(post)),
      related: JSON.parse(JSON.stringify(relatedPosts)),
    };
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

export async function createBlogPost(params: Partial<IBlogPost>) {
  await requirePermission("blog", "create");
  try {
    await connectToDatabase();

    // Auto-calculate reading time if missing (avg 200 words/min)
    if (!params.readingTime && params.content) {
      const wordCount = params.content.replace(/<[^>]+>/g, "").split(/\s+/).length;
      const mins = Math.max(1, Math.ceil(wordCount / 200));
      params.readingTime = `${mins} min read`;
    }

    const post = await BlogPost.create(params);
    revalidatePath("/blog");
    revalidatePath("/dashboard/blog");
    return { success: true, data: JSON.parse(JSON.stringify(post)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create blog post" };
  }
}

export async function updateBlogPost(id: string, params: Partial<IBlogPost>) {
  await requirePermission("blog", "update");
  try {
    await connectToDatabase();

    if (!params.readingTime && params.content) {
      const wordCount = params.content.replace(/<[^>]+>/g, "").split(/\s+/).length;
      const mins = Math.max(1, Math.ceil(wordCount / 200));
      params.readingTime = `${mins} min read`;
    }

    const updated = await BlogPost.findByIdAndUpdate(id, params, { new: true });
    revalidatePath("/blog");
    if (updated?.slug) {
      revalidatePath(`/blog/${updated.slug}`);
    }
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
