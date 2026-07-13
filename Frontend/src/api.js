import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

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
