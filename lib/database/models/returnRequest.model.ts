import { Document, Schema, Types, model, models } from "mongoose";

export interface IReturnRequest extends Document {
  _id: Types.ObjectId;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  items: {
    productTitle: string;
    quantity: number;
  }[];
  reason: string;
  details?: string;
  status: "pending" | "approved" | "rejected" | "completed";
  createdAt?: Date;
  updatedAt?: Date;
}

const ReturnRequestSchema = new Schema(
  {
    orderNumber: { type: String, required: true, index: true },
    customerEmail: { type: String, required: true },
    customerName: { type: String, required: true },
    items: [
      {
        productTitle: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 },
      },
    ],
    reason: { type: String, required: true },
    details: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

const ReturnRequest =
  models.ReturnRequest || model<IReturnRequest>("ReturnRequest", ReturnRequestSchema);

export default ReturnRequest;
