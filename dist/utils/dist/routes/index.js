"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_routes_1 = __importDefault(require("./category.routes"));
const product_routes_1 = __importDefault(require("./product.routes"));
const quote_routes_1 = __importDefault(require("./quote.routes"));
const router = (0, express_1.Router)();
router.use("/categories", category_routes_1.default);
router.use("/products", product_routes_1.default);
router.use("/quotes", quote_routes_1.default);
exports.default = router;
