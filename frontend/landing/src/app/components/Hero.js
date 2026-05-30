"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Code, Shield, Network } from "lucide-react";
import { API_URL } from "../config";

export default function Hero() {
  const [stats, setStats] = useState({
    students: 0,
    passRate: 98,
    tutors: 0
  });

  useEffect(() => {
    fetch(`${API_URL}/api/public/stats`)
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.students === "number") {
          setStats(data);
        }
      })
      .catch(err => console.error("Error fetching public stats:", err));
  }, []);

  return (
    <section id="home" className="relative min-h-[90vh] flex items-center overflow-hidden bg-slate-900 text-white pt-16">

      {/* Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_45%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.1),transparent_50%)]" />

      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20 lg:py-32">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Hero Content */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
              <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              Empowering Sri Lanka's Next Tech Generation
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] font-display">
              Master Modern Tech with <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                ICT Academy
              </span>
            </h1>

            <p className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Step into the future of technology. Gain industry-ready skills with expert-led training, immersive projects, and certifications recognized worldwide.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a
                href="#courses"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                Explore Courses
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#about"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-semibold border border-slate-700 hover:bg-slate-800/50 hover:border-slate-600 transition-all"
              >
                Learn More
              </a>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-8 border-t border-slate-800 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-display">
                  {stats.students.toLocaleString()}+
                </p>
                <p className="text-xs text-slate-400 mt-1">Students Enrolled</p>
              </div>
              <div className="border-x border-slate-800 px-4">
                <p className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-display">
                  {stats.passRate}%
                </p>
                <p className="text-xs text-slate-400 mt-1">Exam Pass Rate</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-display">
                  {stats.tutors}+
                </p>
                <p className="text-xs text-slate-400 mt-1">Expert Tutors</p>
              </div>
            </div>
          </div>

          {/* Hero Visual Card / Presentation */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[420px] aspect-[4/5] rounded-3xl overflow-hidden glassmorphism p-6 flex flex-col justify-between shadow-2xl shadow-blue-900/30 border border-slate-800">

              {/* Header inside visual card */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <div className="text-slate-500 text-xs font-mono">ict-academy.dev</div>
              </div>

              {/* Center visual: Interactive Coding / Tech design */}
              <div className="my-8 flex-1 flex flex-col justify-center space-y-4">
                <div className="flex items-center gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                  <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
                    <Code className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Full Stack Web Dev</h4>
                    <p className="text-xs text-slate-400">HTML, CSS, JS, React & Node</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                  <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0">
                    <Network className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Advanced Networking</h4>
                    <p className="text-xs text-slate-400">Routing, Switching & Security</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                  <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Cybersecurity Essentials</h4>
                    <p className="text-xs text-slate-400">Ethical Hacking & Defence</p>
                  </div>
                </div>
              </div>

              {/* Bottom tag inside visual card */}
              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl p-4 text-center">
                <p className="text-xs font-semibold text-blue-100 uppercase tracking-wider">Live Student LMS Active</p>
                <p className="text-sm font-bold text-white mt-0.5">Learn Anytime, Anywhere</p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
