import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react"; // 🌟 Import useAuth directly for safe loading checks

const ProtectedRoute = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth(); // 🌟 Read live state directly from the source
  const location = useLocation();

  // 1. If Clerk is still reading the browser cookie sessions, show a clean loader placeholder
  if (!isLoaded) {
    return (
      <div
        className="flex-spinner-centered"
        style={{
          height: "60vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p className="loading-text">Verifying security session...</p>
      </div>
    );
  }

  // 2. If fully loaded and the visitor is not signed in, redirect them safely to login
  if (!isSignedIn) {
    return (
      <Navigate
        to="/login"
        state={{ from: location, authMode: "Login" }}
        replace
      />
    );
  }

  // 3. Otherwise, render the secure page views safely
  return children;
};

export default ProtectedRoute;
