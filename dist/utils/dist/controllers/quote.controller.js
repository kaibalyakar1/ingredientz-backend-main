"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markQuoteHandled = exports.getQuote = exports.listQuotes = exports.createQuote = void 0;
const quote_model_1 = __importDefault(require("../models/quote.model"));
const email_service_1 = __importDefault(require("../services/email.service"));
const index_1 = __importDefault(require("../config/index"));
const createQuote = async (req, res) => {
    const { name, email, phone, product, requirement } = req.body;
    const q = await quote_model_1.default.create({ name, email, phone, product, requirement });
    // notify admin via email (non-blocking)
    email_service_1.default
        .sendMail({
        to: index_1.default.email.adminNotification,
        subject: `New Quote from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nRequirement:\n${requirement}\nProduct: ${product || "N/A"}`,
    })
        .catch((err) => {
        // log but don't fail the request
        console.error("Failed sending admin email", err);
    });
    return res.status(201).json(q);
};
exports.createQuote = createQuote;
const listQuotes = async (req, res) => {
    const quotes = await quote_model_1.default.find().sort({ createdAt: -1 }).populate("product");
    res.json(quotes);
};
exports.listQuotes = listQuotes;
const getQuote = async (req, res) => {
    const q = await quote_model_1.default.findById(req.params.id).populate("product");
    if (!q)
        return res.status(404).json({ message: "Not found" });
    res.json(q);
};
exports.getQuote = getQuote;
const markQuoteHandled = async (req, res) => {
    const q = await quote_model_1.default.findByIdAndUpdate(req.params.id, { handled: true }, { new: true });
    if (!q)
        return res.status(404).json({ message: "Not found" });
    res.json(q);
};
exports.markQuoteHandled = markQuoteHandled;
