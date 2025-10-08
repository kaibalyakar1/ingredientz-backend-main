"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.login = exports.signup = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";
const signup = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        const user = new user_model_1.User({ username, email, password, role });
        await user.save();
        res.status(201).json({ message: "User created successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error creating user", error });
    }
};
exports.signup = signup;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await user_model_1.User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, SECRET_KEY, {
            expiresIn: "1h",
        });
        res.status(200).json({ token });
    }
    catch (error) {
        res.status(500).json({ message: "Error logging in", error });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        const user = await user_model_1.User.findById(req.user?.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching profile", error });
    }
};
exports.getProfile = getProfile;
