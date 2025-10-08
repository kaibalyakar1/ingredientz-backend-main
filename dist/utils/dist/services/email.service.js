"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const index_1 = __importDefault(require("../config/index"));
const logger_1 = __importDefault(require("../utils/logger"));
const transporter = nodemailer_1.default.createTransport({
    host: index_1.default.email.host,
    port: index_1.default.email.port,
    secure: index_1.default.email.port === 465,
    auth: {
        user: index_1.default.email.user,
        pass: index_1.default.email.pass,
    },
});
// verify transporter in dev (non-blocking)
transporter
    .verify()
    .then(() => {
    logger_1.default.info("Email transporter ready");
})
    .catch((err) => {
    logger_1.default.warn("Email transporter verification failed", err.message);
});
exports.default = {
    sendMail: async (options) => {
        if (!index_1.default.email.user) {
            logger_1.default.warn("Email user not configured - skipping sendMail");
            return Promise.resolve();
        }
        const opts = {
            from: index_1.default.email.user,
            ...options,
        };
        return transporter.sendMail(opts);
    },
};
