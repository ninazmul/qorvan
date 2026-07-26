import { Document, Schema, Types, model, models } from "mongoose";

export interface ICollection extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  bannerImage?: string;
  isFeatured?: boolean;
  status: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

const CollectionSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    bannerImage: { type: String },
    isFeatured: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

const Collection = models.Collection || model<ICollection>("Collection", CollectionSchema);

export default Collection;
