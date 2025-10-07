import { Router } from "express";
import * as ctrl from "../controllers/product.controller";
import upload from "../middlewares/upload.middleware";

const router = Router();

// Public routes (for users)
router.get("/user", ctrl.listProductsForUser);
router.get("/:id", ctrl.getProductById);

// Admin routes (add authentication/authorization middleware as needed)
router.post("/", upload.array("images", 10), ctrl.createProduct);
router.get("/", ctrl.listProductsForAdmin);
router.get("/category/:categoryId", ctrl.getProductsByCategory);
router.put("/:id", upload.array("images", 10), ctrl.updateProduct);
router.delete("/:id", ctrl.deleteProduct);

export default router;
