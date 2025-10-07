import { Router } from "express";
import { signup, login, getProfile } from "../controllers/user.controller";
import { authenticate, isAdmin } from "../middlewares/auth.middleware";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", authenticate, getProfile);

export default router;
