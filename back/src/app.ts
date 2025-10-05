import express from "express";
import cors from "cors";
import { AppDataSource } from "./config/data-source";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
// app.use("/api/users", userRoutes);

// DB connection
AppDataSource.initialize()
  .then(() => console.log("✅ Database connected"))
  .catch((err: any) => console.error("❌ DB connection failed:", err));

export default app;
