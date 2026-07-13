import React, { lazy, Suspense } from "react";
import { ToastContainer } from "react-toastify";
import CardSkeleton from "./components/CardSkeleton";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Home from "./pages/Home";
import Contact from "./pages/Contact"; // 🌟 1. Imported your new Contact page component
import { BrowserRouter, Routes, Route } from "react-router-dom"; // 🌟 2. Added Routes and Route here
import Auth from "./pages/Auth";
import About from "./pages/About";
import QuizEngine from "./pages/QuizEngine";
import Leaderboard from "./pages/Leaderboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";

const Footer = lazy(() => import("./components/Footer"));
const Practice = lazy(() => import("./pages/Practice.jsx"));

const SkeletonLoader = () => (
  <div className="quiz-grid-layout">
    <CardSkeleton />
    <CardSkeleton />
    <CardSkeleton />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
      <div className="app-container">
        <Navbar />

        <main>
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/practice" element={<Practice />} />

            <Route path="/contact" element={<Contact />} />

            <Route path="/login" element={<Auth />} />

            <Route path="/signup" element={<Auth />} />
            <Route path="/about" element={<About />} />
            <Route path="/quiz" element={<QuizEngine />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/admin" element={<AdminPanel />} />

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

        <Suspense fallback={<SkeletonLoader />}>
          <Footer />
        </Suspense>
      </div>
    </BrowserRouter>
  );
}

export default App;
