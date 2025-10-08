"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategory = exports.listCategoriesForUser = exports.listCategoriesForAdmin = exports.createCategory = void 0;
const category_model_1 = __importDefault(require("../models/category.model"));
const logger_1 = __importDefault(require("../utils/logger"));
const cloudinary_1 = require("cloudinary");
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        // Validate required fields
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category name is required",
            });
        }
        // Check if category already exists
        const existing = await category_model_1.default.findOne({
            name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
        });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: "Category already exists",
            });
        }
        // Get the uploaded image URL from Cloudinary
        const image = req.file?.path || null;
        // Create category
        const category = await category_model_1.default.create({
            name: name.trim(),
            description: description?.trim(),
            image,
        });
        logger_1.default.info(`Category created: ${category.name}`);
        return res.status(201).json({
            success: true,
            data: category,
        });
    }
    catch (err) {
        if (err.code === 11000 && err.keyPattern?.slug) {
            return res.status(409).json({
                success: false,
                message: "Category slug must be unique. Please choose a different name.",
            });
        }
        logger_1.default.error("Error creating category", err);
        return res.status(500).json({
            success: false,
            message: "An error occurred while creating the category",
        });
    }
};
exports.createCategory = createCategory;
const listCategoriesForAdmin = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        // Build search query
        const searchQuery = search
            ? { name: { $regex: search, $options: "i" } }
            : {};
        // Get categories with pagination
        const [categories, total] = await Promise.all([
            category_model_1.default.find(searchQuery)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            category_model_1.default.countDocuments(searchQuery),
        ]);
        return res.json({
            success: true,
            data: categories,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        logger_1.default.error(`Error listing categories: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch categories",
        });
    }
};
exports.listCategoriesForAdmin = listCategoriesForAdmin;
const listCategoriesForUser = async (req, res) => {
    try {
        const categories = await category_model_1.default.find({}, { name: 1, image: 1 }).sort({
            createdAt: -1,
        });
        return res.json({
            success: true,
            data: categories,
        });
    }
    catch (error) {
        logger_1.default.error(`Error listing categories: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch categories",
        });
    }
};
exports.listCategoriesForUser = listCategoriesForUser;
const getCategory = async (req, res) => {
    try {
        const category = await category_model_1.default.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }
        return res.json({
            success: true,
            data: category,
        });
    }
    catch (error) {
        logger_1.default.error(`Error fetching category: ${error.message}`);
        // Handle invalid ObjectId
        if (error.kind === "ObjectId") {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to fetch category",
        });
    }
};
exports.getCategory = getCategory;
const updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const updateData = {};
        // Only update fields that are provided
        if (name !== undefined) {
            // Check if new name already exists (excluding current category)
            const existing = await category_model_1.default.findOne({
                name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
                _id: { $ne: req.params.id },
            });
            if (existing) {
                return res.status(409).json({
                    success: false,
                    message: "Category name already exists",
                });
            }
            updateData.name = name.trim();
        }
        if (description !== undefined) {
            updateData.description = description.trim();
        }
        // Handle image update
        if (req.file?.path) {
            // Delete old image from Cloudinary if exists
            const oldCategory = await category_model_1.default.findById(req.params.id);
            if (oldCategory?.image) {
                try {
                    const publicId = oldCategory.image.split("/").pop()?.split(".")[0];
                    if (publicId) {
                        await cloudinary_1.v2.uploader.destroy(`uploads/${publicId}`);
                    }
                }
                catch (err) {
                    logger_1.default.warn(`Failed to delete old image: ${err}`);
                }
            }
            updateData.image = req.file.path;
        }
        const updated = await category_model_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }
        logger_1.default.info(`Category updated: ${updated.name}`);
        return res.json({
            success: true,
            message: "Category updated successfully",
            data: updated,
        });
    }
    catch (error) {
        logger_1.default.error(`Error updating category: ${error.message}`);
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: Object.values(error.errors).map((e) => e.message),
            });
        }
        if (error.kind === "ObjectId") {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to update category",
        });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        const category = await category_model_1.default.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }
        // Delete image from Cloudinary if exists
        if (category.image) {
            try {
                const publicId = category.image.split("/").pop()?.split(".")[0];
                if (publicId) {
                    await cloudinary_1.v2.uploader.destroy(`uploads/${publicId}`);
                }
            }
            catch (err) {
                logger_1.default.warn(`Failed to delete image from Cloudinary: ${err}`);
            }
        }
        await category_model_1.default.findByIdAndDelete(req.params.id);
        logger_1.default.info(`Category deleted: ${category.name}`);
        return res.status(200).json({
            success: true,
            message: "Category deleted successfully",
        });
    }
    catch (error) {
        logger_1.default.error(`Error deleting category: ${error.message}`);
        if (error.kind === "ObjectId") {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to delete category",
        });
    }
};
exports.deleteCategory = deleteCategory;
