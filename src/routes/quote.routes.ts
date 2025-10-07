import { Router } from "express";
import * as ctrl from "../controllers/quote.controller";

const router = Router();

router.post("/", ctrl.createQuote);
router.get("/", ctrl.listQuotes);
router.get("/:id", ctrl.getQuote);
router.patch("/:id/handled", ctrl.markQuoteHandled);

export default router;
