import { MetadataRoute } from "next";
import { connectToDatabase } from "@/lib/database";
import Product from "@/lib/database/models/product.model";
import Category from "@/lib/database/models/category.model";
import Collection from "@/lib/database/models/collection.model";
import Blog from "@/lib/database/models/blog.model";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectToDatabase();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://qorvan.com";

  // Products
  const products = await Product.find({ status: "active" })
    .select("slug updatedAt")
    .lean<any[]>();

  const productUrls = products.map((p) => ({
    url: `${baseUrl}/product/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  // Categories
  const categories = await Category.find({ isFeatured: true })
    .select("slug updatedAt")
    .lean<any[]>();

  const categoryUrls = categories.map((c) => ({
    url: `${baseUrl}/shop?category=${c.slug}`,
    lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Collections
  const collections = await Collection.find({ status: "active" })
    .select("slug updatedAt")
    .lean<any[]>();

  const collectionUrls = collections.map((c) => ({
    url: `${baseUrl}/shop?collection=${c.slug}`,
    lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Blog Posts
  const blogPosts = await Blog.find({ isPublished: true })
    .select("slug updatedAt")
    .lean<any[]>();

  const blogUrls = blogPosts.map((b) => ({
    url: `${baseUrl}/blog/${b.slug}`,
    lastModified: b.updatedAt ? new Date(b.updatedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

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
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
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
