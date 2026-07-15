import React, { useEffect } from "react"; // Added useEffect here
import Hero from "../components/Hero";
import Practice from "./Practice";
import { Link } from "react-router-dom";
import { getHealthCheck } from "../api.js"; // Imported the health check function

function Home() {
  // Background full-stack connectivity test
  useEffect(() => {
    getHealthCheck().then((data) => {
      if (data) {
        console.log("🟢 Full-Stack Connection Successful:", data.message);
      } else {
        console.error("🔴 Full-Stack Connection Failed: Server unreachable.");
      }
    });
  }, []);

  const examCategories = [
    {
      id: 1,
      title: "MPSC",
      desc: " Meghalaya Civil Service Examination Practice",
    },
    { id: 2, title: "MPSC LDA", desc: "Lower Division Assistant Preparation" },
    { id: 3, title: "Meghalaya Police", desc: "Police Recruitment Exams" },
    { id: 4, title: "Meghalaya TET", desc: "Teacher Eligibility Test" },
    {
      id: 5,
      title: "Secretariat Exams",
      desc: "Government Office Recruitment",
    },
    { id: 6, title: "General Knowledge", desc: "State & National GK" },
  ];

  const appFeatures = [
    { id: 1, title: "Practice Questions", desc: "Unlimited practice mode." },

    { id: 4, title: "Progress Tracking", desc: "Monitor your improvement." },
    { id: 5, title: "Current Affairs", desc: "Daily updated quizzes." },
    {
      id: 6,
      title: "Previous Papers",
      desc: "Practice previous year questions.",
    },
  ];

  const quickAccess = [
    {
      id: 1,
      links: "daily-quiz",
      heading: "Daily Quiz",
      paragraph: "Challenge Yourself Today",
    },
    {
      id: 3,
      links: "leaderboard",
      heading: "Leaderboard",
      paragraph: "Challenge Yourself With Others",
    },
    {
      id: 4,
      links: "dashboard",
      heading: "Dashboard",
      paragraph: "View Your Profile and Perfomance",
    },
  ];

  return (
    <div className="home-page">
      {/* HERO SECTION */}
      <Hero
        title="Meghalaya Government Exam Preparation Platform"
        subtitle="Practice MPSC, DSC, Meghalaya Police, TET, Secretariat and other competitive examinations with thousands of questions."
        primaryBtnText="Start Practice"
        primaryBtnLink="/practice"
      />

      {/* EXAM CATEGORIES */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Exam Categories</h2>
          <div className="card-grid">
            {examCategories.map((category) => (
              <div className="card" key={category.id}>
                <h3>{category.title}</h3>
                <p>{category.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Features</h2>
          <div className="card-grid">
            {appFeatures.map((category) => (
              <div className="card" key={category.id}>
                <h3>{category.title}</h3>
                <p>{category.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUICK ACCESS */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Quick Access</h2>
          <div className="card-grid">
            {quickAccess.map((category) => (
              <Link
                to={`/${category.links}`}
                className="card"
                key={category.id}
              >
                <h3>{category.heading}</h3>
                <p>{category.paragraph}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
