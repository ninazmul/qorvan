import { Document, Schema, Types, model, models } from "mongoose";

export interface IProductVariant {
  sku: string;
  size?: string;
  color?: string;
  colorHex?: string;
  material?: string;
  stock: number;
  priceAdjustment?: number;
  image?: string;
}

export interface IProductSpecification {
  key: string;
  value: string;
}

export interface IProduct extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  specifications: IProductSpecification[];
  careInstructions?: string;
  price: number;
  compareAtPrice?: number;
  costPerItem?: number;
  featuredImage: string;
  images: string[];
  sku: string;
  barcode?: string;
  stock: number;
  lowStockThreshold: number;
  category: Types.ObjectId;
  subcategory?: Types.ObjectId;
  collectionId?: Types.ObjectId;
  brandId?: Types.ObjectId;
  tags: string[];
  sizes: string[];
  colors: { name: string; hex?: string }[];
  materials: string[];
  variants: IProductVariant[];
  status: "draft" | "active" | "archived";
  isFeatured: boolean;
  isTrending: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  canonicalUrl?: string;
  ratings: {
    average: number;
    count: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductVariantSchema = new Schema({
  sku: { type: String, required: true },
  size: { type: String },
  color: { type: String },
  colorHex: { type: String },
  material: { type: String },
  stock: { type: Number, required: true, default: 0 },
  priceAdjustment: { type: Number, default: 0 },
  image: { type: String },
});

const ProductSpecificationSchema = new Schema({
  key: { type: String, required: true },
  value: { type: String, required: true },
});

const ProductSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    specifications: [ProductSpecificationSchema],
    careInstructions: { type: String },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    costPerItem: { type: Number, min: 0 },
    featuredImage: { type: String, required: true },
    images: [{ type: String }],
    sku: { type: String, required: true, index: true },
    barcode: { type: String },
    stock: { type: Number, required: true, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    subcategory: { type: Schema.Types.ObjectId, ref: "Category", index: true },
    collectionId: { type: Schema.Types.ObjectId, ref: "Collection", index: true },
    brandId: { type: Schema.Types.ObjectId, ref: "Brand" },
    tags: [{ type: String }],
    sizes: [{ type: String }],
    colors: [
      {
        name: { type: String, required: true },
        hex: { type: String },
      },
    ],
    materials: [{ type: String }],
    variants: [ProductVariantSchema],
    status: { type: String, enum: ["draft", "active", "archived"], default: "active", index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isTrending: { type: Boolean, default: false, index: true },
    isNewArrival: { type: Boolean, default: false, index: true },
    isBestSeller: { type: Boolean, default: false, index: true },
    seoTitle: { type: String },
    seoDescription: { type: String },
    seoKeywords: [{ type: String }],
    canonicalUrl: { type: String },
    ratings: {
      average: { type: Number, default: 5 },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

ProductSchema.index({ title: "text", description: "text", tags: "text" });
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ price: 1 });

const Product = models.Product || model<IProduct>("Product", ProductSchema);

export default Product;
