import { createContext, useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react"; // 🌟 Added useUser hook

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const backendUrl =
    window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://megha-quiz-87mn.vercel.app";

  const { isSignedIn, userId } = useAuth();
  const { user } = useUser(); // 🌟 Extract profile details like email addresses
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!isSignedIn);
  }, [isSignedIn]);

  // Check if the currently logged-in user is your specific admin email
  const isAdmin = isSignedIn && user?.primaryEmailAddress?.emailAddress === "meghaquiz666@gmail.com";

  const value = {
    backendUrl,
    isLoggedIn,
    setIsLoggedIn,
    userData,
    setUserData,
    userId,
    user,   // Expose the raw user profile
    isAdmin, // 🌟 Expose a clean boolean for simple frontend checks
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
