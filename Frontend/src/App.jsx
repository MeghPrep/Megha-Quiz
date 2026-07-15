import React, { lazy, Suspense } from "react";
import { ToastContainer } from "react-toastify";
import CardSkeleton from "./components/CardSkeleton";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Auth from "./pages/Auth";
import About from "./pages/About";
import QuizEngine from "./pages/QuizEngine";
import Leaderboard from "./pages/Leaderboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import QuizSummary from "./pages/QuizSummary.jsx";
import CurrentAffairsTimeline from "./components/current-affairs/CurrentAffairsTimeline.jsx";
import CurrentAffairsMagazine from "./components/current-affairs/CurrentAffairsMagazine.jsx";

// 🌟 IMPORT YOUR NEW PERFORMANCE WORKSPACE
import StudentDashboard from "./pages/StudentDashboard.jsx";

const Footer = lazy(() => import("./components/Footer"));
const Practice = lazy(() => import("./pages/Practice.jsx"));

const SkeletonLoader = () => (
  <div className="quiz-grid-layout">
    <CardSkeleton />
    <CardSkeleton />
    <CardSkeleton />
  </div>
);

// 1. Layout component that reads the current active URL route path
function AppLayout() {
  const location = useLocation();

  return (
    <div className="app-container">
      <Navbar />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Wrapped Practice with Suspense to handle the lazy import correctly */}
          <Route
            path="/practice"
            element={
              <Suspense fallback={<SkeletonLoader />}>
                <Practice />
              </Suspense>
            }
          />

          <Route path="/contact" element={<Contact />} />

          {/* Capture Clerk authentication sub-routes smoothly */}
          <Route path="/login/*" element={<Auth />} />
          <Route path="/signup/*" element={<Auth />} />

          <Route path="/about" element={<About />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/test-summary" element={<QuizSummary />} />
          <Route path="/current-affairs" element={<CurrentAffairsTimeline />} />
          <Route
            path="/current-affairs/issue/:id"
            element={<CurrentAffairsMagazine />}
          />

          {/* 🌟 MOUNT THE NEW PROTECTED USER PATH ROUTE GRID */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/quiz"
            element={
              <ProtectedRoute>
                <QuizEngine />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {/* Hides the Footer if the user is on the /quiz path */}
      {location.pathname !== "/quiz" && (
        <Suspense fallback={<SkeletonLoader />}>
          <Footer />
        </Suspense>
      )}
    </div>
  );
}

// 2. Clean App component providing the mandatory BrowserRouter context wrapper
function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
