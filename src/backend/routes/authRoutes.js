import { Router } from "express";
import { healthAuth, register, verifyEmail, login, verifyLoginCode } from "../controllers/authController.js";

export const router = Router();

router.get("/health", healthAuth);
router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/verify-login", verifyLoginCode);