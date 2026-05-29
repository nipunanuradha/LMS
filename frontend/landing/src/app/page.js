"use client";

import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import CourseGrid from "./components/CourseGrid";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";
import LoginModal from "./components/LoginModal";

export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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
