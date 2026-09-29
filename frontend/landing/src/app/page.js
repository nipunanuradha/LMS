"use client";

import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import CourseGrid from "./components/CourseGrid";
import Testimonials from "./components/Testimonials";
import ContactForm from "./components/ContactForm";
import LocationMap from "./components/LocationMap";
import Footer from "./components/Footer";
import LoginModal from "./components/LoginModal";

export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    const handlePageShow = () => {
      setIsLoginModalOpen(false);
      setSelectedCourse(null);
    };
    window.addEventListener("pageshow", handlePageShow);

    // Check if ?login=true query param is present
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("login") === "true") {
        setIsLoginModalOpen(true);
        // Clean up the URL parameter from browser history/address bar
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  const handleEnrollClick = (course) => {
    setSelectedCourse(course);
    setIsLoginModalOpen(true);
  };

  const handleNavbarLoginClick = () => {
    setSelectedCourse(null);
    setIsLoginModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Header */}
      <Navbar onLoginClick={handleNavbarLoginClick} />

      <main className="flex-1">
        {/* Hero Banner Section */}
        <Hero />

        {/* Core Features & About */}
        <About />

        {/* Dynamic Courses Listing */}
        <CourseGrid onEnrollClick={handleEnrollClick} />

        {/* Reviews & Social Proof */}
        <Testimonials />

        {/* Contact Form */}
        <ContactForm />

        {/* Location & Google Map Section */}
        <LocationMap />
      </main>

      {/* Footer Branding & Contacts */}
      <Footer />

      {/* Global Authenticator Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        selectedCourse={selectedCourse}
        onClose={() => {
          setIsLoginModalOpen(false);
          setSelectedCourse(null);
        }}
      />
    </div>
  );
}
