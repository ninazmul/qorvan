import { Document, Schema, Types, model, models } from "mongoose";

export interface IDeliveryZone extends Document {
  _id: Types.ObjectId;
  name: string;
  locations: string[];
  baseCharge: number;
  freeDeliveryThreshold?: number;
  estimatedDays: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const DeliveryZoneSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    locations: [{ type: String, required: true }],
    baseCharge: { type: Number, required: true, default: 0 },
    freeDeliveryThreshold: { type: Number, default: 0 },
    estimatedDays: { type: String, required: true, default: "2-3 Days" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const DeliveryZone = models.DeliveryZone || model<IDeliveryZone>("DeliveryZone", DeliveryZoneSchema);

export default DeliveryZone;
