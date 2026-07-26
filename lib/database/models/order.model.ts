import { Document, Schema, Types, model, models } from "mongoose";

export interface IOrderItem {
  product: Types.ObjectId;
  title: string;
  price: number;
  quantity: number;
  image: string;
  sku: string;
  size?: string;
  color?: string;
  variantSku?: string;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  addressLine: string;
  city: string;
  district: string;
  postalCode?: string;
  deliveryZoneId?: string;
  zoneName?: string;
}

export interface ITrackingEvent {
  status: string;
  timestamp: Date;
  note?: string;
  updatedBy?: string;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  orderNumber: string;
  customer?: Types.ObjectId;
  guestInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  deliveryCharge: number;
  discountAmount: number;
  subtotal: number;
  totalAmount: number;
  paymentMethod: "COD" | "ONLINE";
  paymentStatus: "pending" | "paid" | "refunded";
  orderStatus:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned";
  trackingHistory: ITrackingEvent[];
  notes?: string;
  couponCode?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String, required: true },
  sku: { type: String, required: true },
  size: { type: String },
  color: { type: String },
  variantSku: { type: String },
});

const ShippingAddressSchema = new Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  addressLine: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String, required: true },
  postalCode: { type: String },
  deliveryZoneId: { type: String },
  zoneName: { type: String },
});

const TrackingEventSchema = new Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String },
  updatedBy: { type: String },
});

const OrderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", index: true },
    guestInfo: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
    },
    items: [OrderItemSchema],
    shippingAddress: { type: ShippingAddressSchema, required: true },
    deliveryCharge: { type: Number, required: true, default: 0 },
    discountAmount: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["COD", "ONLINE"], default: "COD" },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "pending",
      index: true,
    },
    trackingHistory: [TrackingEventSchema],
    notes: { type: String },
    couponCode: { type: String },
  },
  { timestamps: true }
);

OrderSchema.index({ customer: 1, createdAt: -1 });
OrderSchema.index({ orderStatus: 1, createdAt: -1 });

const Order = models.Order || model<IOrder>("Order", OrderSchema);

export default Order;
