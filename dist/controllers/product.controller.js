"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.listProductsForUser = exports.listProductsForAdmin = exports.getProductsByCategory = exports.createProduct = void 0;
const product_model_1 = __importDefault(require("../models/product.model"));
const category_model_1 = __importDefault(require("../models/category.model"));
const logger_1 = __importDefault(require("../utils/logger"));
const cloudinary_1 = require("cloudinary");
// Create a product with images
const createProduct = async (req, res) => {
    try {
        const { name, price, description, category, displayPrice } = req.body;
        // Validate required fields
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Product name is required",
            });
        }
        if (!category) {
            return res.status(400).json({
                success: false,
                message: "Category is required",
            });
        }
        // Verify category exists
        const categoryExists = await category_model_1.default.findById(category);
        if (!categoryExists) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }
        // Handle multiple image uploads
        const images = [];
        if (req.files && Array.isArray(req.files)) {
            images.push(...req.files.map((file) => file.path));
        }
        else if (req.file) {
            images.push(req.file.path);
        }
        // Create product
        const product = await product_model_1.default.create({
            name: name.trim(),
            price: price ? parseFloat(price) : undefined,
            description: description?.trim(),
            category,
            images,
            displayPrice: displayPrice !== undefined
                ? displayPrice === "true" || displayPrice === true
                : true,
        });
        // Populate category for response
        await product.populate("category");
        logger_1.default.info(`Product created: ${product.name}`);
        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product,
        });
    }
    catch (error) {
        logger_1.default.error(`Error creating product: ${error.message}`);
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
        res.status(500).json({
            success: false,
            message: "Error creating product",
        });
    }
};
exports.createProduct = createProduct;
// Get all products by category
const getProductsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        // Verify category exists
        const category = await category_model_1.default.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }
        const [products, total] = await Promise.all([
            product_model_1.default.find({ category: categoryId })
                .populate("category", "name image")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            product_model_1.default.countDocuments({ category: categoryId }),
        ]);
        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        logger_1.default.error(`Error fetching products by category: ${error.message}`);
        if (error.kind === "ObjectId") {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID",
            });
        }
        res.status(500).json({
            success: false,
            message: "Error fetching products",
        });
    }
};
exports.getProductsByCategory = getProductsByCategory;
// Get all products (Admin)
const listProductsForAdmin = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = "", category } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        // Build search query
        const searchQuery = {};
        if (search) {
            searchQuery.name = { $regex: search, $options: "i" };
        }
        if (category) {
            searchQuery.category = category;
        }
        const [products, total] = await Promise.all([
            product_model_1.default.find(searchQuery)
                .populate("category", "name image")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            product_model_1.default.countDocuments(searchQuery),
        ]);
        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        logger_1.default.error(`Error fetching products: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Error fetching products",
        });
    }
};
exports.listProductsForAdmin = listProductsForAdmin;
// Get all products (User - simplified view)
const listProductsForUser = async (req, res) => {
    try {
        const { category, page = 1, limit = 20 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const searchQuery = {};
        if (category) {
            searchQuery.category = category;
        }
        const [products, total] = await Promise.all([
            product_model_1.default.find(searchQuery, {
                name: 1,
                images: 1,
                price: 1,
                displayPrice: 1,
                category: 1,
            })
                .populate("category", "name")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            product_model_1.default.countDocuments(searchQuery),
        ]);
        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        logger_1.default.error(`Error fetching products: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Error fetching products",
        });
    }
};
exports.listProductsForUser = listProductsForUser;
// Get a single product by ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await product_model_1.default.findById(id).populate("category");
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }
        res.status(200).json({
            success: true,
            data: product,
        });
    }
    catch (error) {
        logger_1.default.error(`Error fetching product: ${error.message}`);
        if (error.kind === "ObjectId") {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }
        res.status(500).json({
            success: false,
            message: "Error fetching product",
        });
    }
};
exports.getProductById = getProductById;
// Update a product
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, description, category, displayPrice, removeImages } = req.body;
        // Check if product exists
        const existingProduct = await product_model_1.default.findById(id);
        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }
        // Build update object
        const updateData = {};
        if (name !== undefined) {
            updateData.name = name.trim();
        }
        if (price !== undefined) {
            updateData.price = price ? parseFloat(price) : undefined;
        }
        if (description !== undefined) {
            updateData.description = description.trim();
        }
        if (displayPrice !== undefined) {
            updateData.displayPrice =
                displayPrice === "true" || displayPrice === true;
        }
        if (category !== undefined) {
            // Verify new category exists
            const categoryExists = await category_model_1.default.findById(category);
            if (!categoryExists) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found",
                });
            }
            updateData.category = category;
        }
        // Handle image removal
        if (removeImages && Array.isArray(removeImages)) {
            const imagesToRemove = removeImages;
            // Delete from Cloudinary
            for (const imageUrl of imagesToRemove) {
                try {
                    const publicId = imageUrl
                        .split("/")
                        .slice(-2)
                        .join("/")
                        .split(".")[0];
                    await cloudinary_1.v2.uploader.destroy(publicId);
                }
                catch (err) {
                    logger_1.default.warn(`Failed to delete image from Cloudinary: ${err}`);
                }
            }
            // Remove from array
            updateData.images = existingProduct.images.filter((img) => !imagesToRemove.includes(img));
        }
        // Handle new image uploads
        if (req.files && Array.isArray(req.files)) {
            const newImages = req.files.map((file) => file.path);
            updateData.images = [
                ...(updateData.images || existingProduct.images),
                ...newImages,
            ];
            // Ensure max 10 images
            if (updateData.images.length > 10) {
                return res.status(400).json({
                    success: false,
                    message: "Maximum 10 images allowed per product",
                });
            }
        }
        else if (req.file) {
            updateData.images = [
                ...(updateData.images || existingProduct.images),
                req.file.path,
            ];
            if (updateData.images.length > 10) {
                return res.status(400).json({
                    success: false,
                    message: "Maximum 10 images allowed per product",
                });
            }
        }
        // Update product
        const product = await product_model_1.default.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).populate("category");
        logger_1.default.info(`Product updated: ${product?.name}`);
        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product,
        });
    }
    catch (error) {
        logger_1.default.error(`Error updating product: ${error.message}`);
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
                message: "Invalid ID",
            });
        }
        res.status(500).json({
            success: false,
            message: "Error updating product",
        });
    }
};
exports.updateProduct = updateProduct;
// Delete a product
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await product_model_1.default.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }
        // Delete all images from Cloudinary
        if (product.images && product.images.length > 0) {
            for (const imageUrl of product.images) {
                try {
                    const publicId = imageUrl
                        .split("/")
                        .slice(-2)
                        .join("/")
                        .split(".")[0];
                    await cloudinary_1.v2.uploader.destroy(publicId);
                }
                catch (err) {
                    logger_1.default.warn(`Failed to delete image from Cloudinary: ${err}`);
                }
            }
        }
        await product_model_1.default.findByIdAndDelete(id);
        logger_1.default.info(`Product deleted: ${product.name}`);
        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });
    }
    catch (error) {
        logger_1.default.error(`Error deleting product: ${error.message}`);
        if (error.kind === "ObjectId") {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }
        res.status(500).json({
            success: false,
            message: "Error deleting product",
        });
    }
};
exports.deleteProduct = deleteProduct;
