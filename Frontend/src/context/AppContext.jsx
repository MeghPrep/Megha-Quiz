import { createContext, useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react"; // 🌟 1. Import Clerk's authentication state hook

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  // FIX: Tries a local development override variable first, then defaults to production
  const backendUrl =
    window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://megha-quiz-87mn.vercel.app";

  const { isSignedIn, userId } = useAuth(); // 🌟 2. Extract live session state from Clerk
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(false);

  // 🌟 3. Watch for changes in Clerk session and update global isLoggedIn state instantly
  useEffect(() => {
    setIsLoggedIn(!!isSignedIn);
  }, [isSignedIn]);

  const value = {
    backendUrl,
    isLoggedIn,
    setIsLoggedIn,
    userData,
    setUserData,
    userId, // 🌟 4. Expose the user ID to the rest of the application
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
