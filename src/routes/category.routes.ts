import { Router } from "express";
import * as ctrl from "../controllers/category.controller";
import upload from "../middlewares/upload.middleware";

const router = Router();

// Public routes (for users)
router.get("/user", ctrl.listCategoriesForUser);
router.get("/:id", ctrl.getCategory);

// Admin routes (add authentication/authorization middleware as needed)
router.post("/", upload.single("image"), ctrl.createCategory);
router.get("/", ctrl.listCategoriesForAdmin);
router.put("/:id", upload.single("image"), ctrl.updateCategory);
router.delete("/:id", ctrl.deleteCategory);

export default router;
