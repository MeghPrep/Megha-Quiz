import users from "../model/users.js";
import "dotenv/config";
import { Webhook } from "svix";

export const clerkWebhook = async (req, res) => {
  try {
    console.log("Webhook Hit!!");
    const payload = req.body.toString();
    const headers = req.headers;
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    // Cryptographically verify that the event originated from Clerk/Svix servers
    const evt = wh.verify(payload, {
      "svix-id": headers["svix-id"],
      "svix-timestamp": headers["svix-timestamp"],
      "svix-signature": headers["svix-signature"],
    });

    const { type, data } = evt;
    console.log("EVENT TYPE:", type);

    // ==========================================================================
    // CASE A: NEW CANDIDATE REGISTRATION (user.created)
    // ==========================================================================
    if (type === "user.created") {
      const primaryEmail =
        data.email_addresses?.find(
          (email) => email.id === data.primary_email_address_id,
        )?.email_address || "";

      // Correct logical comparison grouping for Admin privileges
      const userRole =
        primaryEmail === process.env.ADMIN_EMAIL ||
        primaryEmail === "meghaquiz666@gmail.com"
          ? "admin"
          : "user";

      const fullName =
        `${data.first_name || ""} ${data.last_name || ""}`.trim();
      const profilePicture = data.image_url || ""; // 🌟 Clerk payload contains the dynamic Gmail avatar here

      await users.findOneAndUpdate(
        { clerkId: data.id },
        {
          clerkId: data.id,
          email: primaryEmail,
          fullName: fullName || "Guest User",
          profileImage: profilePicture, // 🌟 Save profile picture string path to database mapping fields
          role: userRole,
          isLoggedIn: true, // Mark active upon immediate register landing flow
        },
        { upsert: true, new: true },
      );
      console.log(
        `🚀 Profile initialised & synced for admin/user: ${fullName}`,
      );
    }

    // ==========================================================================
    // CASE B: USER MODIFIES PROFILE PICTURE/INFO OVER ON GOOGLE (user.updated)
    // ==========================================================================
    if (type === "user.updated") {
      const primaryEmail =
        data.email_addresses?.find(
          (email) => email.id === data.primary_email_address_id,
        )?.email_address || "";

      const fullName =
        `${data.first_name || ""} ${data.last_name || ""}`.trim();
      const profilePicture = data.image_url || ""; // 🌟 Catch profile image updates instantly

      await users.findOneAndUpdate(
        { clerkId: data.id },
        {
          email: primaryEmail,
          fullName: fullName || "Guest User",
          profileImage: profilePicture, // 🌟 Keep picture link in sync
        },
      );
      console.log(`🔄 Profile image updates synced for user: ${fullName}`);
    }

    // ==========================================================================
    // CASE C: LOGIN DETECTED (session.created)
    // ==========================================================================
    if (type === "session.created") {
      console.log("LOGIN Detected");
      await users.findOneAndUpdate(
        { clerkId: data.user_id },
        { isLoggedIn: true },
        { upsert: true, new: true },
      );
    }

    // ==========================================================================
    // CASE D: LOGOUT DETECTED (session.ended || session.removed)
    // ==========================================================================
    if (type === "session.ended" || type === "session.removed") {
      console.log("LOGOUT Detected");
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
