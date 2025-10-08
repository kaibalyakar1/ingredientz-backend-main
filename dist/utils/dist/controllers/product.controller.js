"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.getProduct = exports.listProducts = exports.createProduct = void 0;
const product_model_1 = __importDefault(require("../models/product.model"));
const createProduct = async (req, res) => {
    const payload = req.body;
    const p = await product_model_1.default.create(payload);
    return res.status(201).json(p);
};
exports.createProduct = createProduct;
const listProducts = async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const products = await product_model_1.default.find()
        .populate("category")
        .skip(skip)
        .limit(Number(limit));
    const total = await product_model_1.default.countDocuments();
    return res.json({ data: products, total });
};
exports.listProducts = listProducts;
const getProduct = async (req, res) => {
    const p = await product_model_1.default.findById(req.params.id).populate("category");
    if (!p)
        return res.status(404).json({ message: "Not found" });
    return res.json(p);
};
exports.getProduct = getProduct;
const updateProduct = async (req, res) => {
    const p = await product_model_1.default.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });
    if (!p)
        return res.status(404).json({ message: "Not found" });
    return res.json(p);
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    await product_model_1.default.findByIdAndDelete(req.params.id);
    return res.status(204).send();
};
exports.deleteProduct = deleteProduct;
