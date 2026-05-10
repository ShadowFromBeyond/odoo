import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { adminRoutes } from "./routes/adminRoutes.js";
import { authRoutes } from "./routes/authRoutes.js";
import { exploreRoutes } from "./routes/exploreRoutes.js";
import { publicRoutes } from "./routes/publicRoutes.js";
import { tripRoutes } from "./routes/tripRoutes.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL ?? "http://localhost:5173" }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ status: "ok", app: "Traveloop API" }));
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/explore", exploreRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/public", publicRoutes);
app.use(errorMiddleware);
