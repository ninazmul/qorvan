import { Document, Schema, Types, model, models } from "mongoose";

export interface IBrand extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  status: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

const BrandSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    logo: { type: String },
    description: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

const Brand = models.Brand || model<IBrand>("Brand", BrandSchema);

export default Brand;
