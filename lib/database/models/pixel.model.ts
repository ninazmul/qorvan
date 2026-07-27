import { Document, Schema, Types, model, models } from "mongoose";

export interface IPixelConfig extends Document {
  _id: Types.ObjectId;
  metaPixelId?: string;
  metaAccessToken?: string;
  googleTagId?: string; // GA4 or G-tag ID
  googleAdsConversionId?: string;
  googleAdsConversionLabel?: string;
  tikTokPixelId?: string;
  headerScript?: string;
  bodyScript?: string;
  trackPageView: boolean;
  trackAddToCart: boolean;
  trackInitiateCheckout: boolean;
  trackPurchase: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const PixelConfigSchema = new Schema(
  {
    metaPixelId: { type: String, default: "" },
    metaAccessToken: { type: String, default: "" },
    googleTagId: { type: String, default: "" },
    googleAdsConversionId: { type: String, default: "" },
    googleAdsConversionLabel: { type: String, default: "" },
    tikTokPixelId: { type: String, default: "" },
    headerScript: { type: String, default: "" },
    bodyScript: { type: String, default: "" },
    trackPageView: { type: Boolean, default: true },
    trackAddToCart: { type: Boolean, default: true },
    trackInitiateCheckout: { type: Boolean, default: true },
    trackPurchase: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const PixelConfig = models.PixelConfig || model<IPixelConfig>("PixelConfig", PixelConfigSchema);

export default PixelConfig;
