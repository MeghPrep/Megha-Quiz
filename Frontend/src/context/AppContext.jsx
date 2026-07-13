import { createContext, useState } from "react";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  // FIX: Tries a local development override variable first, then defaults to production
  const backendUrl =
    window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://megha-quiz-react.onrender.com";

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(false);

  const value = {
    backendUrl,
    isLoggedIn,
    setIsLoggedIn,
    userData,
    setUserData,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
