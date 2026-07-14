import React, { lazy, Suspense } from "react";
import { ToastContainer } from "react-toastify";
import CardSkeleton from "./components/CardSkeleton";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
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

const Footer = lazy(() => import("./components/Footer"));
const Practice = lazy(() => import("./pages/Practice.jsx"));

const SkeletonLoader = () => (
  <div className="quiz-grid-layout">
    <CardSkeleton />
    <CardSkeleton />
    <CardSkeleton />
  </div>
);

// 1. New Layout component that safely reads the current active URL route path
function AppLayout() {
  const location = useLocation();

  return (
    <div className="app-container">
      <Navbar />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/contact" element={<Contact />} />

          {/* 🌟 FIX: Appended /* to capture Clerk authentication sub-routes smoothly */}
          <Route path="/login/*" element={<Auth />} />
          <Route path="/signup/*" element={<Auth />} />

          <Route path="/about" element={<About />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/test-summary" element={<QuizSummary />} />

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
