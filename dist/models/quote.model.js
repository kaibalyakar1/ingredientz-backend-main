"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const QuoteSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    product: { type: mongoose_1.Schema.Types.ObjectId, ref: "Product" },
    requirement: { type: String, required: true },
    handled: { type: Boolean, default: false },
    image: { type: String }, // Added image field
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Quote", QuoteSchema);
