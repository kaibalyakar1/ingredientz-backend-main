"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const slugify_1 = __importDefault(require("slugify"));
const CategorySchema = new mongoose_1.Schema({
    name: {
        type: String,
        unique: true,
        trim: true,
        minlength: [2, "Category name must be at least 2 characters"],
        maxlength: [50, "Category name cannot exceed 50 characters"],
    },
    slug: {
        type: String,
        unique: true,
        required: true,
        default: function () {
            return (0, slugify_1.default)(this.name || "", { lower: true, strict: true });
        },
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, "Description cannot exceed 500 characters"],
    },
    image: {
        type: String,
        default: null,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Pre-save hook to generate slug
CategorySchema.pre("save", function (next) {
    if (this.isModified("name")) {
        this.slug = (0, slugify_1.default)(this.name, { lower: true, strict: true });
    }
    next();
});
// Index for faster queries
CategorySchema.index({ name: 1 });
CategorySchema.index({ slug: 1 });
exports.default = (0, mongoose_1.model)("Category", CategorySchema);
