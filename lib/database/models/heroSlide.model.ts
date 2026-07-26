import { Document, Schema, Types, model, models } from "mongoose";

export interface IHeroSlide extends Document {
  _id: Types.ObjectId;
  title: string;
  subtitle?: string;
  backgroundImage: string;
  buttonText?: string;
  buttonUrl?: string;
  order: number;
  enabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const HeroSlideSchema = new Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    backgroundImage: { type: String, required: true },
    buttonText: { type: String, default: "" },
    buttonUrl: { type: String, default: "" },
    order: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

HeroSlideSchema.index({ order: 1 });

const HeroSlide = models.HeroSlide || model("HeroSlide", HeroSlideSchema);

export default HeroSlide;
