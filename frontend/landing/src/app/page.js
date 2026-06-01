"use client";

import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import CourseGrid from "./components/CourseGrid";
import Testimonials from "./components/Testimonials";
import ContactForm from "./components/ContactForm";
import Footer from "./components/Footer";
import LoginModal from "./components/LoginModal";

export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const handlePageShow = () => {
      setIsLoginModalOpen(false);
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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Header */}
      <Navbar onLoginClick={() => setIsLoginModalOpen(true)} />

      <main className="flex-1">
        {/* Hero Banner Section */}
        <Hero />

        {/* Core Features & About */}
        <About />

        {/* Dynamic Courses Listing */}
        <CourseGrid onEnrollClick={() => setIsLoginModalOpen(true)} />

        {/* Reviews & Social Proof */}
        <Testimonials />

        {/* Contact Form */}
        <ContactForm />
      </main>

      {/* Footer Branding & Contacts */}
      <Footer />

      {/* Global Authenticator Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
