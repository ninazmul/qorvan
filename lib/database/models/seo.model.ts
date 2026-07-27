import { Document, Schema, Types, model, models } from "mongoose";

export interface ISeoPage extends Document {
  _id: Types.ObjectId;
  route: string; // e.g. "/", "/shop", "/blog", "/contact", "/about"
  pageName: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCardTitle?: string;
  twitterCardDescription?: string;
  twitterCardImage?: string;
  canonicalUrl?: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const SeoPageSchema = new Schema(
  {
    route: { type: String, required: true, unique: true, index: true },
    pageName: { type: String, required: true },
    metaTitle: { type: String, required: true },
    metaDescription: { type: String, required: true },
    keywords: { type: [String], default: [] },
    ogTitle: { type: String },
    ogDescription: { type: String },
    ogImage: { type: String },
    twitterCardTitle: { type: String },
    twitterCardDescription: { type: String },
    twitterCardImage: { type: String },
    canonicalUrl: { type: String },
    robotsIndex: { type: Boolean, default: true },
    robotsFollow: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const SeoPage = models.SeoPage || model<ISeoPage>("SeoPage", SeoPageSchema);

export default SeoPage;
