import axios from "axios";

// ✅ DYNAMIC CONFIGURATION: Points to the local server or the true backend production URL
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://vercel.app"; // 🌟 Point directly to your active Vercel backend server!

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

export const getHealthCheck = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      credentials: "include",
    });
    return await response.json();
  } catch (error) {
    console.error("Failed to connect to backend server:", error);
    throw error;
  }
};

export { axios };
