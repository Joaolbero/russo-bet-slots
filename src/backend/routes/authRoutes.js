import { Router } from "express";
import { healthAuth } from "../controllers/authController.js";

export const router = Router();

router.get("/health", healthAuth);