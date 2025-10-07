import { Request, Response } from "express";
import Product from "../models/product.model";
import Category from "../models/category.model";
import logger from "../utils/logger";
import { v2 as cloudinary } from "cloudinary";

// Create a product with images
export const createProduct = async (req: Request, res: Response) => {
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
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Handle multiple image uploads
    const images: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      images.push(...req.files.map((file: any) => file.path));
    } else if (req.file) {
      images.push(req.file.path);
    }

    // Create product
    const product = await Product.create({
      name: name.trim(),
      price: price ? parseFloat(price) : undefined,
      description: description?.trim(),
      category,
      images,
      displayPrice:
        displayPrice !== undefined
          ? displayPrice === "true" || displayPrice === true
          : true,
    });

    // Populate category for response
    await product.populate("category");

    logger.info(`Product created: ${product.name}`);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error: any) {
    logger.error(`Error creating product: ${error.message}`);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map((e: any) => e.message),
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

// Get all products by category
export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const [products, total] = await Promise.all([
      Product.find({ category: categoryId })
        .populate("category", "name image")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments({ category: categoryId }),
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
  } catch (error: any) {
    logger.error(`Error fetching products by category: ${error.message}`);

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

// Get all products (Admin)
export const listProductsForAdmin = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search = "", category } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build search query
    const searchQuery: any = {};

    if (search) {
      searchQuery.name = { $regex: search, $options: "i" };
    }

    if (category) {
      searchQuery.category = category;
    }

    const [products, total] = await Promise.all([
      Product.find(searchQuery)
        .populate("category", "name image")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(searchQuery),
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
  } catch (error: any) {
    logger.error(`Error fetching products: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
    });
  }
};

// Get all products (User - simplified view)
export const listProductsForUser = async (req: Request, res: Response) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const searchQuery: any = {};
    if (category) {
      searchQuery.category = category;
    }

    const [products, total] = await Promise.all([
      Product.find(searchQuery, {
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
      Product.countDocuments(searchQuery),
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
  } catch (error: any) {
    logger.error(`Error fetching products: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
    });
  }
};

// Get a single product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).populate("category");

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
  } catch (error: any) {
    logger.error(`Error fetching product: ${error.message}`);

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

// Update a product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, price, description, category, displayPrice, removeImages } =
      req.body;

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Build update object
    const updateData: any = {};

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
      const categoryExists = await Category.findById(category);
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
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          logger.warn(`Failed to delete image from Cloudinary: ${err}`);
        }
      }

      // Remove from array
      updateData.images = existingProduct.images.filter(
        (img) => !imagesToRemove.includes(img)
      );
    }

    // Handle new image uploads
    if (req.files && Array.isArray(req.files)) {
      const newImages = req.files.map((file: any) => file.path);
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
    } else if (req.file) {
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
    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("category");

    logger.info(`Product updated: ${product?.name}`);

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error: any) {
    logger.error(`Error updating product: ${error.message}`);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map((e: any) => e.message),
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

// Delete a product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
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
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          logger.warn(`Failed to delete image from Cloudinary: ${err}`);
        }
      }
    }

    await Product.findByIdAndDelete(id);

    logger.info(`Product deleted: ${product.name}`);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error: any) {
    logger.error(`Error deleting product: ${error.message}`);

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
