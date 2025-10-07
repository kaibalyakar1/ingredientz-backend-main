import { Router } from "express";
import categoryRoutes from "./category.routes";
import productRoutes from "./product.routes";
import quoteRoutes from "./quote.routes";

const router = Router();

router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/quotes", quoteRoutes);

export default router;
