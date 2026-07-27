import { Document, Schema, Types, model, models } from "mongoose";

export interface IBlogPost extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: string;
  category: string;
  tags: string[];
  readingTime?: string;
  isPublished: boolean;
  publishedAt?: Date;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  canonicalUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const BlogPostSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    featuredImage: { type: String, required: true },
    author: { type: String, default: "QORVAN Editorial" },
    category: { type: String, default: "Fashion & Style", index: true },
    tags: [{ type: String }],
    readingTime: { type: String, default: "4 min read" },
    isPublished: { type: Boolean, default: true, index: true },
    publishedAt: { type: Date, default: Date.now },
    seoTitle: { type: String },
    seoDescription: { type: String },
    seoKeywords: [{ type: String }],
    canonicalUrl: { type: String },
  },
  { timestamps: true }
);

BlogPostSchema.index({ title: "text", excerpt: "text", content: "text" });

const BlogPost = models.BlogPost || model<IBlogPost>("BlogPost", BlogPostSchema);

export default BlogPost;
