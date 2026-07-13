import dns from "dns";
import express from "express";
import cors from "cors";
import "dotenv/config";
import { clerkMiddleware } from "@clerk/express";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";

import authorityRoutes from "./routes/authorityRoutes.js";
import recruitmentRoutes from "./routes/recruitmentRoutes.js";
import paperRoutes from "./routes/paperRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();
const PORT = 3000;

/* MIDDLEWARE */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(clerkMiddleware());

/* DB */
connectDB();
/* ROUTES */
app.use("/api/user", userRoutes);
app.use("/api/authority", authorityRoutes);
app.use("/api/recruitment", recruitmentRoutes);
app.use("/api/paper", paperRoutes);
app.use("/api/question", questionRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API WORKING" });
});

app.listen(PORT, () => {
  console.log(`server started on http://localhost:${PORT}`);
});
