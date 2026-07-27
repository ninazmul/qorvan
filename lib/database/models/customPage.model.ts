import { Document, Schema, Types, model, models } from "mongoose";

export interface ICustomPageSection {
  heading: string;
  body: string;
}

export interface ICustomPage extends Document {
  _id: Types.ObjectId;
  slug: "about" | "privacy" | "returns" | "terms";
  title: string;
  subtitle?: string;
  content?: string;
  sections: ICustomPageSection[];
  createdAt?: Date;
  updatedAt?: Date;
}

const CustomPageSectionSchema = new Schema({
  heading: { type: String, required: true },
  body: { type: String, required: true },
});

const CustomPageSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      enum: ["about", "privacy", "returns", "terms"],
      index: true,
    },
    title: { type: String, required: true },
    subtitle: { type: String },
    content: { type: String },
    sections: [CustomPageSectionSchema],
  },
  { timestamps: true }
);

const CustomPage = models.CustomPage || model<ICustomPage>("CustomPage", CustomPageSchema);

export default CustomPage;
