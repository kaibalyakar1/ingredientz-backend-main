"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ProductSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    images: [{ type: String }],
    category: { type: mongoose_1.Schema.Types.ObjectId, ref: "Category", required: true },
    description: { type: String },
    price: { type: Number },
    displayPrice: { type: Boolean, default: true },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Product", ProductSchema);
