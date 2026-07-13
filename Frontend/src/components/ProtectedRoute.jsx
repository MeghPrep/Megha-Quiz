import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useContext(AppContext);
  const location = useLocation();

  if (!isLoggedIn) {
    // Redirect to login page, but remember where they were trying to go
    return <Navigate to="/login" state={{ from: location, authMode: "Login" }} replace />;
  }

  return children;
};

export default ProtectedRoute;
