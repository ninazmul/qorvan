import { Document, Schema, Types, model, models } from "mongoose";

export interface IContactMessage extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: "unread" | "read";
  createdAt?: Date;
  updatedAt?: Date;
}

const ContactMessageSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    subject: { type: String, default: "" },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["unread", "read"],
      default: "unread",
    },
  },
  { timestamps: true }
);

const ContactMessage =
  models.ContactMessage || model("ContactMessage", ContactMessageSchema);

export default ContactMessage;
