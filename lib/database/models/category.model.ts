import { Document, Schema, Types, model, models } from "mongoose";

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: Types.ObjectId;
  isFeatured?: boolean;
  order?: number;
  status: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

const CategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    image: { type: String },
    parentId: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    isFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

CategorySchema.index({ parentId: 1, name: 1 });

const Category = models.Category || model<ICategory>("Category", CategorySchema);

export default Category;
