import express from "express";
import cors from "cors";
import { AppDataSource } from "./config/data-source";
import { errorHandler } from "./utils/handler";
import route from "./routes";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:4000", String(process.env.FRONTEND_URL)],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());
app.use("/api", route);
app.use(errorHandler);
app.get("/", (req, res) => res.send("api is working"));

// DB connection
AppDataSource.initialize()
  .then(() => console.log("✅ Database connected"))
  .catch((err: any) => console.error("❌ DB connection failed:", err));

export default app;
