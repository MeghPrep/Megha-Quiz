import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom'; // 🌟 1. Added routing imports
import { Menu, X } from 'lucide-react'; // 🌟 2. Added responsive icons
import SearchBox from './SearchBox';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  // 🌟 3. State to control the mobile hamburger drawer open/close
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    setIsMenuOpen(false); // Auto-close drawer on link navigation
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        
        {/* LOGO LINK */}
        <div className="logo">
          <Link to="/" onClick={() => handleNavigation('/')}>Megha Quiz</Link>
        </div>

        {/* 🌟 CORTANA MOBILE ICON / PC SEARCH CONTAINER */}
        <div className="navbar-search-container">
          <SearchBox />
        </div>

        {/* 🌟 HAMBURGER BUTTON (Hidden on Desktop, Visible on Mobile) */}
        <button 
          className="navbar-hamburger" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* 🌟 WRAPPER: Handles hiding/showing the menu on small screens */}
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
              <Link to="/logout" className='btn btn-outline' onClick={() => setIsMenuOpen(false)}>Logout</Link>
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
