import { Router } from "express";
import { healthAuth, register, verifyEmail } from "../controllers/authController.js";

export const router = Router();

router.get("/health", healthAuth);
router.post("/register", register);
router.post("/verify-email", verifyEmail);