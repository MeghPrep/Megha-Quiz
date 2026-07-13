import React from 'react'

const Footer = () => {

  const currentYear = new Date().getFullYear();

  return (
    <footer className='footer'>
      <div className="footer-container">

        {/* BRAND INFO */}
        <div className="footer-brand">
          <h3>Megha Quiz</h3>
          <p>Meghalaya's dedicated exam preparation platform for
            MPSC, Meghalaya Police, TET, Secretariat Exams,
            Current Affairs, and General Knowledge.
          </p>
          </div>

          {/* QUICK LINKS */}
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/practice">Practice</a></li>
              <li><a href="/mock-test">Mock Test</a></li>
              <li><a href="/daily-quiz">Daily Quiz</a></li>
            </ul>
          </div>

          {/* RESOURCES */}
        <div className="footer-links">
          <h4>Resources</h4>
          <ul>
            <li><a href="/current-affairs">Current Affairs</a></li>
            <li><a href="/previous-papers">Previous Papers</a></li>
            <li><a href="/bookmarks">Bookmarks</a></li>
            <li><a href="/dashboard">Dashboard</a></li>
          </ul>
        </div>

        {/* SUPPORT */}
        <div className="footer-links">
          <h4>Support</h4>
          <ul>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/login">Login</a></li>
            <li><a href="/signup">Register</a></li>
          </ul>
        </div>

      </div>
    </footer>
  )
}

export default Footer