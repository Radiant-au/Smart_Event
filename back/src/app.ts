import express from "express";
import cors from "cors";
import { AppDataSource } from "./config/data-source";
import { errorHandler } from "./utils/handler";
import route from "./routes";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:4000", "https://example.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(errorHandler);
app.use(express.json());
app.use("/api", route);

// DB connection
AppDataSource.initialize()
  .then(() => console.log("✅ Database connected"))
  .catch((err: any) => console.error("❌ DB connection failed:", err));

export default app;
