"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategory = exports.listCategories = exports.createCategory = void 0;
const category_model_1 = __importDefault(require("../models/category.model"));
const createCategory = async (req, res) => {
    const { name, slug, description } = req.body;
    const existing = await category_model_1.default.findOne({ $or: [{ name }, { slug }] });
    if (existing)
        return res.status(409).json({ message: "Category exists" });
    const cat = await category_model_1.default.create({ name, slug, description });
    return res.status(201).json(cat);
};
exports.createCategory = createCategory;
const listCategories = async (req, res) => {
    const categories = await category_model_1.default.find().sort({ createdAt: -1 });
    return res.json(categories);
};
exports.listCategories = listCategories;
const getCategory = async (req, res) => {
    const category = await category_model_1.default.findById(req.params.id);
    if (!category)
        return res.status(404).json({ message: "Not found" });
    return res.json(category);
};
exports.getCategory = getCategory;
const updateCategory = async (req, res) => {
    const updated = await category_model_1.default.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });
    if (!updated)
        return res.status(404).json({ message: "Not found" });
    return res.json(updated);
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    await category_model_1.default.findByIdAndDelete(req.params.id);
    return res.status(204).send();
};
exports.deleteCategory = deleteCategory;
