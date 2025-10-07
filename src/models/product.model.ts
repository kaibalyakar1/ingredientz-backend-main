import { Schema, model, Document, Types } from "mongoose";

export interface IProduct extends Document {
  name: string;
  images: string[];
  category: Types.ObjectId;
  description?: string;
  price?: number;
  displayPrice: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"],
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr: string[]) {
          return arr.length <= 10;
        },
        message: "A product can have a maximum of 10 images",
      },
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    price: {
      type: Number,
      min: [0, "Price cannot be negative"],
      validate: {
        validator: function (v: number) {
          return v === undefined || v >= 0;
        },
        message: "Price must be a positive number",
      },
    },
    displayPrice: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ProductSchema.index({ name: 1 });
ProductSchema.index({ category: 1, createdAt: -1 });
ProductSchema.index({ createdAt: -1 });

ProductSchema.virtual("imageCount").get(function () {
  return this.images.length;
});

export default model<IProduct>("Product", ProductSchema);
