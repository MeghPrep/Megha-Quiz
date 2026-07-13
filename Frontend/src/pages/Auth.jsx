import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSignIn, useSignUp } from "@clerk/clerk-react"; 
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext.jsx";
import logoImg from "../assets/logo.png";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { isLoaded: signInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: signUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();

  const { isLoggedIn, setIsLoggedIn } = useContext(AppContext);
  const [state, setState] = useState(location.state?.authMode || "Login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // 🌟 New states to handle email verification codes
  const [verifying, setVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const oauthLogin = async (provider) => {
    try {
      const activeStrategy = `oauth_${provider}`;
      if (state === "Login") {
        await signIn.authenticateWithRedirect({
          strategy: activeStrategy,
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/practice",
        });
      } else {
        await signUp.authenticateWithRedirect({
          strategy: activeStrategy,
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/practice",
        });
      }
    } catch (error) {
      console.error(`${provider} OAuth Error:`, error);
      toast.error(`Failed to connect with ${provider}`);
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (loading || !signInLoaded || !signUpLoaded) return;
    setLoading(true);
    setMessage("");

    try {
      if (state === "Sign Up") {
        const nameParts = name.trim().split(" ");
        const firstName = nameParts[0] || "Guest";
        const lastName = nameParts.slice(1).join(" ") || "";

        // 1. Start the sign-up process
        await signUp.create({
          emailAddress: email,
          password: password,
          firstName,
          lastName,
        });

        // 2. Request an email verification code
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        
        // 3. Switch the UI layout to the verification screen
        setVerifying(true);
        toast.info("Verification code sent to your email!");
      } else {
        const signInAttempt = await signIn.create({
          identifier: email,
          password,
        });

        if (signInAttempt.status === "complete") {
          await setSignInActive({ session: signInAttempt.createdSessionId });
          setIsLoggedIn(true);
          toast.success("Login Successful!");
          
          const originPath = location.state?.from?.pathname || "/";
          const originSearch = location.state?.from?.search || "";
          navigate(`${originPath}${originSearch}`);
        }
      }
    } catch (error) {
      const errorMessage = error.errors?.[0]?.message || error.message || "An authentication error occurred.";
      setMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 🌟 Handles submitting the 6-digit code to Clerk
  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    if (loading || !signUpLoaded) return;
    setLoading(true);
    setMessage("");

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (completeSignUp.status === "complete") {
        await setSignUpActive({ session: completeSignUp.createdSessionId });
        setIsLoggedIn(true);
        toast.success("Account verified and created successfully!");
        navigate("/practice");
      }
    } catch (error) {
      const errorMessage = error.errors?.[0]?.message || error.message || "Invalid verification code.";
      setMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">
            <img src={logoImg} alt="Logo" />
          </div>
          <h2>{verifying ? "Verify Email" : state === "Login" ? "Welcome Back" : "Create Account"}</h2>
          <p>
            {verifying 
              ? `Enter the verification code sent to ${email}`
              : state === "Login"
                ? "Sign in to Megha Quiz"
                : "Join Megha Quiz by creating an account today"}
          </p>
        </div>

        {message && (
          <div className="alert alert-danger" style={{ color: "red", padding: "10px 0" }}>
            ❌ {message}
          </div>
        )}

        {/* 🌟 If verifying, show ONLY the verification form */}
        {verifying ? (
          <form onSubmit={handleVerificationSubmit}>
            <div className="form-group">
              <label htmlFor="verification-code">6-Digit Verification Code</label>
              <input
                id="verification-code"
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Verifying..." : "Verify Code"}
            </button>
            <button 
              type="button" 
              className="toggle-view-btn" 
              style={{ marginTop: "15px", width: "100%" }}
              onClick={() => setVerifying(false)}
            >
              Go Back
            </button>
          </form>
        ) : (
          /* Standard Login / Signup Forms */
          <>
            <button type="button" className="oauth-btn" onClick={() => oauthLogin("google")}>
              <img
                className="oauth-icon"
                src="https://gstatic.com"
                alt="Google"
              />
              Continue with Google
            </button>

            <button type="button" className="oauth-btn" onClick={() => oauthLogin("github")}>
              <svg className="oauth-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Continue with GitHub
            </button>

            <div className="oauth-divider">
              <span>or {state === "Login" ? "sign in" : "sign up"} with email</span>
            </div>

            <form id={state === "Login" ? "loginForm" : "signupForm"} onSubmit={onSubmitHandler}>
              {state === "Sign Up" && (
                <div className="form-group">
                  <label htmlFor="auth-name">Full Name</label>
                  <input
                    id="auth-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="auth-email">Email Address</label>
                <input
                  id="auth-email"
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="auth-password">Password</label>
                <input
                  id="auth-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="auth-controls-row">
                <div className="remember-me-container">
                  <input
                    id="auth-remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="auth-remember">Remember me</label>
                </div>
                {state === "Login" && <a href="#forgot" className="forgot-pass-link">Forgot Password?</a>}
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? "Processing..." : state}
              </button>
            </form>

            <div className="auth-toggle-footer">
              <p>
            {state === "Login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="toggle-view-btn"
              onClick={() => {
                setState(state === "Login" ? "Sign Up" : "Login");
                setMessage("");
              }}
            >
              {state === "Login" ? "Sign Up" : "Login"}
            </button>
          </p>
        </div>
      </>
    )}
  </div>
</div>
  );
};

export default Auth;
