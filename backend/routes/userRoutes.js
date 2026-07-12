import express from "express";
import { clerkWebhook } from "../controllers/webhook.js";

const userRoutes = express.Router();

userRoutes.post(
  "/webhook/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhook,
);

export default userRoutes;
