import { MetadataRoute } from "next";
import { connectToDatabase } from "@/lib/database";
import Product from "@/lib/database/models/product.model";
import Category from "@/lib/database/models/category.model";
import Collection from "@/lib/database/models/collection.model";
import Blog from "@/lib/database/models/blog.model";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://qorvan.com";

  let productUrls: any[] = [];
  let categoryUrls: any[] = [];
  let collectionUrls: any[] = [];
  let blogUrls: any[] = [];

  try {
    await connectToDatabase();

    // Products
    const products = await Product.find({ status: "active" })
      .select("slug updatedAt")
      .lean<any[]>();

    productUrls = products.map((p) => ({
      url: `${baseUrl}/product/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    }));

    // Categories
    const categories = await Category.find()
      .select("slug updatedAt")
      .lean<any[]>();

    categoryUrls = categories.map((c) => ({
      url: `${baseUrl}/shop?category=${c.slug}`,
      lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // Collections
    const collections = await Collection.find({ status: "active" })
      .select("slug updatedAt")
      .lean<any[]>();

    collectionUrls = collections.map((c) => ({
      url: `${baseUrl}/shop?collection=${c.slug}`,
      lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    // Blog Posts
    const blogPosts = await Blog.find({ isPublished: true })
      .select("slug updatedAt")
      .lean<any[]>();

    blogUrls = blogPosts.map((b) => ({
      url: `${baseUrl}/blog/${b.slug}`,
      lastModified: b.updatedAt ? new Date(b.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Failed to build dynamic sitemap entries:", error);
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/returns`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    ...productUrls,
    ...categoryUrls,
    ...collectionUrls,
    ...blogUrls,
  ];
}
