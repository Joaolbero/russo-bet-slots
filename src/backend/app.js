import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { router as authRoutes } from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "russo-bet-slots" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});