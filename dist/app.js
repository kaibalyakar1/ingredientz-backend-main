"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const index_1 = __importDefault(require("./routes/index"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const index_2 = __importDefault(require("./config/index"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)("combined"));
app.use((0, express_rate_limit_1.default)({
    windowMs: index_2.default.rateLimit.windowMs,
    max: index_2.default.rateLimit.max,
}));
app.use("/api/v1", index_1.default);
exports.default = app;
