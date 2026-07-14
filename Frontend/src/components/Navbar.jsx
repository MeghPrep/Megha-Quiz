import React, { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom"; // 🌟 Replaced useNavigate/currentPath with useLocation
import { Menu, X } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react"; // 🌟 Import Clerk UI Components
import SearchBox from "./SearchBox";

const Navbar = () => {
  const location = useLocation(); // 🌟 Hooks into your router to dynamically know the active path
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  const handleReset = (e) => {
    e.preventDefault();
    console.log("Quiz application state reset clicked.");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* LOGO LINK */}
        <div className="logo">
          <Link to="/" onClick={() => setIsMenuOpen(false)}>
            Megha Quiz
          </Link>
        </div>

        {/* CORTANA MOBILE ICON / PC SEARCH CONTAINER */}
        <div className="navbar-search-container">
          <SearchBox />
        </div>

        {/* HAMBURGER BUTTON */}
        <button
          className="navbar-hamburger"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* WRAPPER: Handles hiding/showing the menu on small screens */}
        <div className={`navbar-menu-wrapper ${isMenuOpen ? "active" : ""}`}>
          <ul className="nav-links">
            <li>
              <NavLink to="/" onClick={() => setIsMenuOpen(false)}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/practice" onClick={() => setIsMenuOpen(false)}>
                Practice
              </NavLink>
            </li>
            <li>
              <NavLink to="/daily-quiz" onClick={() => setIsMenuOpen(false)}>
                Daily Quiz
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/current-affairs"
                onClick={() => setIsMenuOpen(false)}
              >
                Current Affairs
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" onClick={() => setIsMenuOpen(false)}>
                About
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact" onClick={() => setIsMenuOpen(false)}>
                Contact
              </NavLink>
            </li>
          </ul>

          <div
            className="nav-buttons"
            style={{ display: "flex", alignItems: "center", gap: "12px" }}
          >
            {/* 🌟 Shown ONLY when user is logged out */}
            <SignedOut>
              <Link
                to="/login"
                className="btn btn-outline"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="btn btn-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            </SignedOut>

            {/* 🌟 Shown ONLY when user is logged in (Beautiful profile circle with built-in logout menu) */}
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>

            {/* 🌟 Conditional active page Reset handler utilizing react-router state */}
            <SignedIn>
              {(location.pathname === "/mock-test" ||
                location.pathname === "/practice" ||
                location.pathname === "/daily-quiz") && (
                <Link
                  to="#"
                  className="btn btn-primary"
                  onClick={(e) => {
                    handleReset(e);
                    setIsMenuOpen(false);
                  }}
                >
                  Reset
                </Link>
              )}
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
