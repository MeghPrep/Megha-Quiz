import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import axios from "axios"; // 🌟 Import axios
import { toast } from "react-toastify"; // 🌟 Import toast

function Contact() {
  const { user, isLoaded } = useUser(); // 🌟 Read the authenticated user session
  const [loading, setLoading] = useState(false); // 🌟 Loading tracker state

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  // 🌟 Automatically pre-fill Name and Email fields if a logged-in user is detected
  useEffect(() => {
    if (isLoaded && user) {
      setFormData((prevData) => ({
        ...prevData,
        name: user.fullName || "",
        email: user.emailAddresses?.[0]?.emailAddress || "",
      }));
    }
  }, [user, isLoaded]);

  // 🌟 Refactored Form Submission Hook calling your Nodemailer Express API
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      // Dynamic route handler configuration matching your infrastructure paths
      const backendUrl =
        window.location.hostname === "localhost"
          ? "http://localhost:3000"
          : "https://megha-quiz-87mn.vercel.app"; // 🌟 Synced with your production domain

      const { data } = await axios.post(
        `${backendUrl}/api/contact/send`,
        formData,
      );

      if (data.success) {
        toast.success(data.message || "Message delivered successfully!");
        // Clear message and subject fields but keep name and email cached for seamless UX
        setFormData((prev) => ({ ...prev, subject: "", message: "" }));
      } else {
        toast.error(data.message || "Failed to process delivery parameters.");
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "Something went wrong sending your message.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
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
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  required
                ></textarea>
              </div>

              <button
                className="btn btn-primary"
                type="submit"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Message"}
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
                For exam-related queries, include subject and exam name for
                faster support.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
