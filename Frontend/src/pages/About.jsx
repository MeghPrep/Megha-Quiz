import React from "react";
import { Link } from "react-router-dom";

function About() {
  return (
    <div className="about-page-wrapper">
      {/* HERO SECTION */}
      <section className="about-hero">
        <div className="container">
          <h1>About Megha Quiz App</h1>
          <p>
            A smart exam preparation platform built for Meghalaya Public Service Commission aspirants.
          </p>
        </div>
      </section>

      {/* MISSION SECTION */}
      <section className="about-section">
        <div className="container">
          <div className="about-card">
            <h2>Our Mission</h2>
            <p>
              To make exam preparation simple, structured, and effective for every student preparing for MPSC and other Meghalaya government exams.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES MATRIX SECTION */}
      <section className="about-section">
        <div className="container">
          <h2 className="section-title">What We Provide</h2>

          <div className="feature-grid">
            <div className="feature-card">
              <h3>Practice Mode</h3>
              <p>Instant feedback with explanations for every question.</p>
            </div>

            <div className="feature-card">
              <h3>Mock Tests</h3>
              <p>Real exam-like environment with scoring system.</p>
            </div>

            <div className="feature-card">
              <h3>Previous Papers</h3>
              <p>Practice real exam questions from past years.</p>
            </div>

            <div className="feature-card">
              <h3>Performance Tracking</h3>
              <p>Track your weak areas and improve systematically.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TARGET AUDIENCE HIGHLIGHT SECTION */}
      <section className="about-section">
        <div className="container">
          <div className="about-card highlight">
            <h2>Who is this for?</h2>
            <p>
              This platform is designed for MPSC aspirants including LDA, CCE, Police, TET, Secretariat exams and general competitive exam learners.
            </p>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION (CTA) FOOTER BLOCK */}
      <section className="about-cta">
        <div className="container">
          <h2>Start Your Preparation Today</h2>
          <p>Practice daily and improve step by step.</p>
          {/* Swapped custom string pointer anchor to single-page application router route link */}
          <Link to="/practice" className="btn btn-primary">
            Start Practicing
          </Link>
        </div>
      </section>
    </div>
  );
}

export default About;
