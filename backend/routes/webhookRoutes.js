import express from "express";
import { clerkWebhook } from "../controllers/webhook.js";

const router = express.Router();

// 🔒 Clerk Webhook Endpoint Receiver
router.post(
  "/clerk",
  // CRITICAL: Tells express to keep the signature payload as an unparsed raw buffer string for svix validation
  express.raw({ type: "application/json" }),
  clerkWebhook,
);

export default router;
