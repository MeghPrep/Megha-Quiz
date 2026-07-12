import users from "../model/users.js";
import "dotenv/config";
import { Webhook } from "svix";

export const clerkWebhook = async (req, res) => {
  try {
    console.log("Webhook Hit!!");
    const payload = req.body.toString();
    const headers = req.headers;
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    const evt = wh.verify(payload, {
      "svix-id": headers["svix-id"],
      "svix-timestamp": headers["svix-timestamp"],
      "svix-signature": headers["svix-signature"],
    });

    const { type, data } = evt;
    console.log("EVENT TYPE:", type);

    if (type === "user.created") {
      const primaryEmail =
        data.email_addresses.find(
          (email) => email.id === data.primary_email_address_id,
        )?.email_address || "";

      // FIXED: Correct logical comparison grouping
      const userRole =
        primaryEmail === process.env.ADMIN_EMAIL ||
        primaryEmail === "meghaquiz666@gmail.com"
          ? "admin"
          : "user";

      // FIXED: Using matching variable names (primaryEmail and userRole)
      await users.findOneAndUpdate(
        { clerkId: data.id },
        {
          clerkId: data.id,
          email: primaryEmail,
          fullName: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          role: userRole,
        },
        { upsert: true, new: true },
      );
    }

    if (type === "session.created") {
      console.log("LOGIN Detected");
      // FIXED: Replaced 'User' with your imported 'users' model name
      await users.findOneAndUpdate(
        { clerkId: data.user_id },
        { isLoggedIn: true },
        { upsert: true, new: true },
      );
    }

    if (type === "session.ended" || type === "session.removed") {
      console.log("LOGOUT Detected");
      // FIXED: Replaced 'User' with your imported 'users' model name
      await users.findOneAndUpdate(
        { clerkId: data.user_id },
        { isLoggedIn: false },
      );
    }

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Webhook error", error);
    res.status(400).json({
      success: false,
      message: "Webhooks Error",
    });
  }
};
