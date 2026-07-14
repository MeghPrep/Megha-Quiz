import React from "react";
import { useLocation } from "react-router-dom";
import { SignIn, SignUp } from "@clerk/clerk-react"; // 🌟 Import Clerk's premium components
import logoImg from "../assets/logo.png";

const Auth = () => {
  const location = useLocation();

  // 🌟 FIX: Changed from === to .startsWith() to match multi-factor and verification sub-routes
  const isSignUp = location.pathname.startsWith("/signup");

  return (
    <div
      className="auth-page"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
        padding: "20px",
      }}
    >
      {/* BRANDING LOGO */}
      <div
        className="auth-logo"
        style={{ marginBottom: "24px", textAlign: "center" }}
      >
        <img
          src={logoImg}
          alt="Megha Quiz Logo"
          style={{ height: "60px", width: "auto" }}
        />
        <h2 style={{ marginTop: "12px", fontSize: "24px", fontWeight: "bold" }}>
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h2>
      </div>

      {/* CLERK COMPONENT HUB */}
      {isSignUp ? (
        <SignUp
          routing="path"
          path="/signup"
          signInUrl="/login"
          forceRedirectUrl="/practice"
        />
      ) : (
        <SignIn
          routing="path"
          path="/login"
          signUpUrl="/signup"
          forceRedirectUrl="/practice"
        />
      )}
    </div>
  );
};

export default Auth;
