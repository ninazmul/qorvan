import { Document, Schema, Types, model, models } from "mongoose";

export interface IProductReview extends Document {
  _id: Types.ObjectId;
  product: Types.ObjectId;
  user?: Types.ObjectId;
  authorName: string;
  authorEmail: string;
  rating: number;
  comment: string;
  images?: string[];
  status: "pending" | "approved" | "rejected";
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductReviewSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    authorName: { type: String, required: true },
    authorEmail: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    images: [{ type: String }],
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
  },
  { timestamps: true }
);

const ProductReview = models.ProductReview || model<IProductReview>("ProductReview", ProductReviewSchema);

export default ProductReview;
