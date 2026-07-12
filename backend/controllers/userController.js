import users from "../model/users.js";
import { getAuth } from "@clerk/express";

// Get user statistics
export const getStatistics = async (req, res) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

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
