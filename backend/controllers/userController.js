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

    // 🌟 1. Fetch full profile details directly from Clerk using the backend client SDK [1]
    const clerkUser = await clerkClient.users.getUser(userId);
    const profilePicture = clerkUser.imageUrl || ""; // 🌟 Pull Gmail/Clerk profile picture string URL link

    // 🌟 2. Check if this logged-in Clerk user exists in your MongoDB
    let userRecord = await users.findOne({ clerkId: userId });

    if (!userRecord) {
      const emailAddress = clerkUser.emailAddresses[0]?.emailAddress || "";
      const fullName =
        `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();

      // 🌟 3. Create the missing profile entry in your Atlas Database with the picture [1]
      userRecord = await users.create({
        clerkId: userId,
        fullName: fullName || "Guest User",
        email: emailAddress,
        profileImage: profilePicture, // 🌟 Save picture string path to database mapping fields
        role: "user",
        isLoggedIn: true,
      });
    } else {
      // 🌟 4. FALLBACK UPGRADE: If user exists but lacks a picture or picture changed, synchronize it!
      let shouldSave = false;

      if (
        !userRecord.profileImage ||
        userRecord.profileImage !== profilePicture
      ) {
        userRecord.profileImage = profilePicture;
        shouldSave = true;
      }

      if (!userRecord.isLoggedIn) {
        userRecord.isLoggedIn = true;
        shouldSave = true;
      }

      if (shouldSave) {
        await userRecord.save();
      }
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
