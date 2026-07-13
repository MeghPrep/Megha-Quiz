import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext.jsx";
import logoImg from "../assets/logo.png";

const Auth = () => {
  // ==========================
  // React Router
  // ==========================
  const navigate = useNavigate();
  const location = useLocation();

  // ==========================
  // Context
  // ==========================
  const { backendUrl, isLoggedIn, setIsLoggedIn } = useContext(AppContext);

  // ==========================
  // States
  // ==========================
  const [state, setState] = useState(location.state?.authMode || "Login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  // ==========================
  // OAuth Login
  // ==========================
  const oauthLogin = (provider) => {
    // Ensures clean slash configuration dynamically
    const cleanBaseUrl = backendUrl.endsWith("/")
      ? backendUrl
      : `${backendUrl}/`;
    window.location.href = `${cleanBaseUrl}api/v1/auth/oauth/${provider}`;
  };

  // ==========================
  // Login / Register Form Submission
  // ==========================
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setMessage("");

    axios.defaults.withCredentials = true;

    // Ensures baseline URL string always formats an ending forward slash
    const cleanBaseUrl = backendUrl.endsWith("/")
      ? backendUrl
      : `${backendUrl}/`;

    try {
      if (state === "Sign Up") {
        // FIX: Pointed to /api/v1/auth/signup to match your exact Express route names
        const { data } = await axios.post(`${cleanBaseUrl}api/v1/auth/signup`, {
          name,
          email,
          password,
        });

        if (data.success) {
          toast.success(data.message || "Registration Successful!");
          setIsLoggedIn(true);
          setName("");
          setEmail("");
          setPassword("");
          setMessage("");

          if (data.user?.role === "admin") {
            navigate("/admin");
          } else {
            navigate("/");
          }
        } else {
          setMessage(data.message);
          toast.error(data.message);
        }
      } else {
        // FIX: Pointed to /api/v1/auth/login to match your exact Express route names
        const { data } = await axios.post(`${cleanBaseUrl}api/v1/auth/login`, {
          email,
          password,
        });

        if (data.success) {
          toast.success(data.message || "Login Successful!");
          setIsLoggedIn(true);
          setEmail("");
          setPassword("");
          setMessage("");

          // Clean dynamic path interception logic
          const originPath = location.state?.from?.pathname || "/";
          const originSearch = location.state?.from?.search || "";
          navigate(`${originPath}${originSearch}`);
        } else {
          setMessage(data.message);
          toast.error(data.message);
        }
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong.";

      setMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* LOGO AND DYNAMIC HEADER */}
        <div className="auth-logo">
          <div className="logo-icon">
            <img src={logoImg} alt="Logo" />
          </div>
          <h2>{state === "Login" ? "Welcome Back" : "Create Account"}</h2>
          <p>
            {state === "Login"
              ? "Sign in to Megha Quiz"
              : "Join Megha Quiz by creating an account today"}
          </p>
        </div>

        {/* ==========================
            Google OAuth
        ========================== */}
        <button
          type="button"
          className="oauth-btn"
          onClick={() => oauthLogin("google")}
        >
          <img
            className="oauth-icon"
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
          />
          Continue with Google
        </button>

        {/* ==========================
            GitHub OAuth
        ========================== */}
        <button
          type="button"
          className="oauth-btn"
          onClick={() => oauthLogin("github")}
        >
          <svg className="oauth-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Continue with GitHub
        </button>

        {/* ==========================
            Divider
        ========================== */}
        <div className="oauth-divider">
          <span>or {state === "Login" ? "sign in" : "sign up"} with email</span>
        </div>

        {/* ==========================
            Error/Alert Banner
        ========================== */}
        {message && (
          <div
            className="alert alert-danger"
            style={{ color: "red", padding: "10px 0" }}
          >
            ❌ {message}
          </div>
        )}

        {/* ==========================
            Form Component Area
        ========================== */}
        <form
          id={state === "Login" ? "loginForm" : "signupForm"}
          onSubmit={onSubmitHandler}
        >
          {/* Full Name Input (Visible during Sign Up view state values only) */}
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

          {/* Email Address Input */}
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

          {/* Password Input */}
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

          {/* Controls bar: Includes Remember Me Checkbox and Forgot Password Link */}
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

            {state === "Login" && (
              <button
                type="button"
                className="link-btn"
                onClick={() => navigate("/reset-password")}
              >
                Forgot Password?
              </button>
            )}
          </div>

          {/* Form Action Submit Button Control */}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading
              ? state === "Login"
                ? "Signing In..."
                : "Creating Account..."
              : state === "Login"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        {/* Footnote Toggle Redirect Link Options */}
        <div className="auth-link">
          {state === "Login"
            ? "Don't have an account? "
            : "Already have an account? "}

          <button
            type="button"
            className="link-btn toggle-view-btn"
            onClick={() => {
              setState(state === "Login" ? "Sign Up" : "Login");
              setMessage("");
              setName("");
              setEmail("");
              setPassword("");
            }}
          >
            {state === "Login" ? "Create one" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
