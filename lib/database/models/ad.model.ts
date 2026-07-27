import { Document, Schema, Types, model, models } from "mongoose";

export interface IAdCampaign extends Document {
  _id: Types.ObjectId;
  name: string;
  platform: "meta" | "google" | "tiktok";
  objective: "conversions" | "traffic" | "awareness" | "lead_generation";
  status: "draft" | "active" | "paused" | "completed";
  budgetType: "daily" | "total";
  budgetAmount: number;
  currency: string;
  startDate?: Date;
  endDate?: Date;
  targeting: {
    location?: string[];
    ageMin?: number;
    ageMax?: number;
    gender?: "all" | "male" | "female";
    interests?: string[];
  };
  creative: {
    headline: string;
    description?: string;
    mediaUrl?: string;
    ctaText?: string;
    destinationUrl?: string;
  };
  metrics?: {
    impressions?: number;
    clicks?: number;
    spend?: number;
    conversions?: number;
  };
  externalCampaignId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const AdCampaignSchema = new Schema(
  {
    name: { type: String, required: true },
    platform: {
      type: String,
      enum: ["meta", "google", "tiktok"],
      required: true,
      default: "meta",
    },
    objective: {
      type: String,
      enum: ["conversions", "traffic", "awareness", "lead_generation"],
      default: "conversions",
    },
    status: {
      type: String,
      enum: ["draft", "active", "paused", "completed"],
      default: "draft",
    },
    budgetType: { type: String, enum: ["daily", "total"], default: "daily" },
    budgetAmount: { type: Number, required: true },
    currency: { type: String, default: "BDT" },
    startDate: { type: Date },
    endDate: { type: Date },
    targeting: {
      location: { type: [String], default: ["Bangladesh"] },
      ageMin: { type: Number, default: 18 },
      ageMax: { type: Number, default: 65 },
      gender: { type: String, enum: ["all", "male", "female"], default: "all" },
      interests: { type: [String], default: [] },
    },
    creative: {
      headline: { type: String, required: true },
      description: { type: String },
      mediaUrl: { type: String },
      ctaText: { type: String, default: "Shop Now" },
      destinationUrl: { type: String, default: "/" },
    },
    metrics: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      spend: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
    },
    externalCampaignId: { type: String },
  },
  { timestamps: true }
);

const AdCampaign = models.AdCampaign || model<IAdCampaign>("AdCampaign", AdCampaignSchema);

export default AdCampaign;
