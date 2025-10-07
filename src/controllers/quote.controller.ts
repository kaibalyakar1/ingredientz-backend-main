import { Request, Response } from "express";
import Quote from "../models/quote.model";
import emailService from "../services/email.service";
import config from "../config/index";

export const createQuote = async (req: Request, res: Response) => {
  const { name, email, phone, product, requirement } = req.body;
  const q = await Quote.create({ name, email, phone, product, requirement });

  // notify admin via email (non-blocking)
  emailService
    .sendMail({
      to: config.email.adminNotification,
      subject: `New Quote from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nRequirement:\n${requirement}\nProduct: ${product || "N/A"}`,
    })
    .catch((err) => {
      // log but don't fail the request
      console.error("Failed sending admin email", err);
    });

  return res.status(201).json(q);
};

export const listQuotes = async (req: Request, res: Response) => {
  const quotes = await Quote.find().sort({ createdAt: -1 }).populate("product");
  res.json(quotes);
};

export const getQuote = async (req: Request, res: Response) => {
  const q = await Quote.findById(req.params.id).populate("product");
  if (!q) return res.status(404).json({ message: "Not found" });
  res.json(q);
};

export const markQuoteHandled = async (req: Request, res: Response) => {
  const q = await Quote.findByIdAndUpdate(
    req.params.id,
    { handled: true },
    { new: true }
  );
  if (!q) return res.status(404).json({ message: "Not found" });
  res.json(q);
};
