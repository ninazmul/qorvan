import { Document, Schema, Types, model, models } from "mongoose";

export interface ICoupon extends Document {
  _id: Types.ObjectId;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate?: Date;
  endDate?: Date;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const CouponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    discountType: { type: String, enum: ["percentage", "fixed"], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date },
    usageLimit: { type: Number },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Coupon = models.Coupon || model<ICoupon>("Coupon", CouponSchema);

export default Coupon;
