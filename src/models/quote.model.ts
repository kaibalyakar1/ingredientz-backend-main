import { Schema, model, Document } from "mongoose";

export interface IQuote extends Document {
  name: string;
  email: string;
  phone: string;
  product?: Schema.Types.ObjectId;
  requirement: string;
  handled: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string; // Added image field
}

const QuoteSchema = new Schema<IQuote>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    requirement: { type: String, required: true },
    handled: { type: Boolean, default: false },
    image: { type: String }, // Added image field
  },
  { timestamps: true }
);

export default model<IQuote>("Quote", QuoteSchema);
