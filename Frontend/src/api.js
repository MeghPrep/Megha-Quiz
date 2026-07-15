import axios from "axios";

// ✅ Explicitly target your actual live backend instance on production
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://megha-quiz-87mn.vercel.app";

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
