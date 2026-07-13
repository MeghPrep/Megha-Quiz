import React, { useState } from "react";

function Contact() {
  // Optional state management to capture form text data cleanly
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting Contact Data:", formData);
    // You can integrate your backend server submission endpoint API here later
  };

  return (
    <div className="contact-page-wrapper">
      {/* HERO SECTION */}
      <section className="contact-hero">
        <div className="container">
          <h1>Contact & Support</h1>
          <p>Have questions, feedback, or issues? We’re here to help you.</p>
        </div>
      </section>

      {/* CONTACT LAYOUT SECTION */}
      <section className="contact-section">
        <div className="container contact-grid">
          
          {/* LEFT COLUMN: INTERACTIVE INPUT FORM */}
          <div className="contact-card">
            <h2>Send a Message</h2>
            <form id="contactForm" onSubmit={handleSubmit}>
              
              <div className="form-group">
                <label htmlFor="contact-name">Name</label>
                <input 
                  id="contact-name"
                  type="text" 
                  placeholder="Your full name" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-email">Email</label>
                <input 
                  id="contact-email"
                  type="email" 
                  placeholder="you@example.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-subject">Subject</label>
                <input 
                  id="contact-subject"
                  type="text" 
                  placeholder="What is this about?" 
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-message">Message</label>
                <textarea 
                  id="contact-message"
                  placeholder="Write your message..."
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                ></textarea>
              </div>

              <button className="btn btn-primary" type="submit">
                Send Message
              </button>

            </form>
          </div>

          {/* RIGHT COLUMN: CONTACT DETAILS PANEL */}
          <div className="contact-info">
            
            <div className="info-card">
              <h3>Email</h3>
              <p>meghaquiz666@gmail.com</p>
            </div>

            <div className="info-card">
              <h3>Phone</h3>
              <p>+91 60097 73776</p>
            </div>

            <div className="info-card">
              <h3>Response Time</h3>
              <p>Within 24–48 hours</p>
            </div>

            <div className="info-card highlight">
              <h3>Important Note</h3>
              <p>
                For exam-related queries, include subject and exam name for faster support.
              </p>
            </div>

          </div>

        </div>
      </section>
    </div>
  );
}

export default Contact;
