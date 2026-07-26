import { Document, Schema, Types, model, models } from "mongoose";

export interface IWishlist extends Document {
  _id: Types.ObjectId;
  userId: string;
  products: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

const WishlistSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

const Wishlist = models.Wishlist || model<IWishlist>("Wishlist", WishlistSchema);

export default Wishlist;
