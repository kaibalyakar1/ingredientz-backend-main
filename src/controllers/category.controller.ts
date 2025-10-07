import { Request, Response } from "express";
import Category from "../models/category.model";
import logger from "../utils/logger";
import { v2 as cloudinary } from "cloudinary";

export const createCategory = async (req: Request, res: Response) => {
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
    const existing = await Category.findOne({
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
    const category = await Category.create({
      name: name.trim(),
      description: description?.trim(),
      image,
    });

    logger.info(`Category created: ${category.name}`);

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error: any) {
    logger.error(`Error creating category: ${error.message}`);

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map((e: any) => e.message),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};

export const listCategoriesForAdmin = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build search query
    const searchQuery = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    // Get categories with pagination
    const [categories, total] = await Promise.all([
      Category.find(searchQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Category.countDocuments(searchQuery),
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
  } catch (error: any) {
    logger.error(`Error listing categories: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

export const listCategoriesForUser = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({}, { name: 1, image: 1 }).sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    logger.error(`Error listing categories: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

export const getCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);

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
  } catch (error: any) {
    logger.error(`Error fetching category: ${error.message}`);

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

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const updateData: any = {};

    // Only update fields that are provided
    if (name !== undefined) {
      // Check if new name already exists (excluding current category)
      const existing = await Category.findOne({
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
      const oldCategory = await Category.findById(req.params.id);
      if (oldCategory?.image) {
        try {
          const publicId = oldCategory.image.split("/").pop()?.split(".")[0];
          if (publicId) {
            await cloudinary.uploader.destroy(`uploads/${publicId}`);
          }
        } catch (err) {
          logger.warn(`Failed to delete old image: ${err}`);
        }
      }

      updateData.image = req.file.path;
    }

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    logger.info(`Category updated: ${updated.name}`);

    return res.json({
      success: true,
      message: "Category updated successfully",
      data: updated,
    });
  } catch (error: any) {
    logger.error(`Error updating category: ${error.message}`);

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

    return res.status(500).json({
      success: false,
      message: "Failed to update category",
    });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);

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
          await cloudinary.uploader.destroy(`uploads/${publicId}`);
        }
      } catch (err) {
        logger.warn(`Failed to delete image from Cloudinary: ${err}`);
      }
    }

    await Category.findByIdAndDelete(req.params.id);

    logger.info(`Category deleted: ${category.name}`);

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    logger.error(`Error deleting category: ${error.message}`);

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
