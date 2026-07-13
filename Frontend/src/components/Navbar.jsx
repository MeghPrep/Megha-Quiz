import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom'; // 🌟 Added useNavigate
import { Menu, X } from 'lucide-react'; 
import { useAuth, useClerk } from "@clerk/clerk-react"; // 🌟 Import Clerk hooks
import SearchBox from './SearchBox';

const Navbar = () => {
  const navigate = useNavigate();
  const { signOut } = useClerk(); // 🌟 Clerk sign out handler
  const { isSignedIn } = useAuth(); // 🌟 Live sync with Clerk session status
  
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Computed layout state matching Clerk session
  const isLoggedIn = !!isSignedIn;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  const handleReset = (e) => {
    e.preventDefault();
    console.log("Quiz application state reset clicked.");
  };

  const handleNavigation = (path) => {
    setCurrentPath(path);
    setIsMenuOpen(false); 
  };

  // 🌟 Handles clearing session out from Clerk securely
  const handleLogoutHandler = async (e) => {
    e.preventDefault();
    setIsMenuOpen(false);
    try {
      await signOut();
      navigate("/"); // Send user back home after logout
    } catch (error) {
      console.error("Clerk Sign Out error:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        
        {/* LOGO LINK */}
        <div className="logo">
          <Link to="/" onClick={() => handleNavigation('/')}>Megha Quiz</Link>
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
            <li><NavLink to="/" onClick={() => handleNavigation('/')}>Home</NavLink></li>
            <li><NavLink to="/practice" onClick={() => handleNavigation('/practice')}>Practice</NavLink></li>
            <li><NavLink to="/mock-test" onClick={() => handleNavigation('/mock-test')}>Mock Test</NavLink></li>
            <li><NavLink to="/daily-quiz" onClick={() => handleNavigation('/daily-quiz')}>Daily Quiz</NavLink></li>
            <li><NavLink to="/current-affairs" onClick={() => handleNavigation('/current-affairs')}>Current Affairs</NavLink></li>
            <li><NavLink to="/about" onClick={() => handleNavigation('/about')}>About</NavLink></li>
            <li><NavLink to="/contact" onClick={() => handleNavigation('/contact')}>Contact</NavLink></li>
          </ul>

          <div className="nav-buttons">
            {isLoggedIn ? (
              /* 🌟 Updated to trigger Clerk's sign out pipeline handler */
              <button className='btn btn-outline' onClick={handleLogoutHandler} style={{ cursor: 'pointer' }}>
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className='btn btn-outline' onClick={() => setIsMenuOpen(false)}>Login</Link>
                <Link to="/signup" className="btn btn-primary" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
              </>
            )}
            
            {isLoggedIn && (currentPath === "/mock-test" || currentPath === '/practice' || currentPath === '/daily-quiz') && (
              <Link to="/restartBtn" className='btn btn-primary' onClick={(e) => { handleReset(e); setIsMenuOpen(false); }}>Reset</Link>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;
