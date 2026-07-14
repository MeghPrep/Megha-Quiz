import users from "../model/users.js";
import { getAuth, clerkClient } from "@clerk/express"; // 🌟 Import clerkClient for profile lookup

// Get user statistics (with built-in database auto-sync)
export const getStatistics = async (req, res) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // 🌟 1. On-Demand Sync: Check if this logged-in Clerk user exists in your MongoDB
    let userRecord = await users.findOne({ clerkId: userId });

    if (!userRecord) {
      // 🌟 2. Fetch full profile details directly from Clerk using the backend client SDK [1]
      const clerkUser = await clerkClient.users.getUser(userId);
      const emailAddress = clerkUser.emailAddresses[0]?.emailAddress || "";
      const fullName =
        `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();

      // 🌟 3. Create the missing profile entry in your Atlas Database [1]
      userRecord = await users.create({
        clerkId: userId,
        fullName: fullName || "Guest User",
        email: emailAddress,
        role: "user",
        isLoggedIn: true,
      });
    } else if (!userRecord.isLoggedIn) {
      // If the user exists but was flagged logged out, toggle their active state
      userRecord.isLoggedIn = true;
      await userRecord.save();
    }

    // --- Original Statistics Math Logic ---
    const totalUsers = await users.countDocuments();

    const usersLoggedIn = await users.countDocuments({
      isLoggedIn: true,
    });

    return res.json({
      success: true,
      totalUsers,
      usersLoggedIn,
      usersLoggedInPercentage:
        totalUsers > 0
          ? ((usersLoggedIn / totalUsers) * 100).toFixed(2)
          : "0.00",
    });
  } catch (error) {
    console.error("Admin Statistics Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
