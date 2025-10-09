import express from "express";
import cors from "cors";
import { AppDataSource } from "./config/data-source";
import { errorHandler } from "./utils/handler";
import route from "./routes";

const app = express();

app.use(cors());
app.use(errorHandler)
app.use(express.json());
app.use('/api', route);

// Routes
// app.use("/api/users", userRoutes);

// DB connection
AppDataSource.initialize()
  .then(() => console.log("✅ Database connected"))
  .catch((err: any) => console.error("❌ DB connection failed:", err));

export default app;
