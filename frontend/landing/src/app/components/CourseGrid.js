"use client";

import { useEffect, useState } from "react";
import { BookOpen, User, DollarSign } from "lucide-react";

export default function CourseGrid({ onEnrollClick }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fallback mock courses if the database is empty or connection fails
  const fallbackCourses = [
    {
      id: 1,
      title: "Advanced Java Programming & Design",
      description: "Dive deep into functional programming, concurrency, spring boot, microservices and enterprise software patterns.",
      price: 12500.00,
      thumbnail_url: "",
      students: 450,
    },
    {
      id: 2,
      title: "Full-Stack React & Node.js Developer",
      description: "Build scalable web applications from scratch using React, Next.js, Express, and modern SQL databases.",
      price: 15000.00,
      thumbnail_url: "",
      students: 620,
    },
    {
      id: 3,
      title: "Networking Essentials & CCNA Prep",
      description: "Prepare for your CCNA exam with extensive routing, switching, subnetting labs, and network security exercises.",
      price: 8500.00,
      thumbnail_url: "",
      students: 310,
    },
  ];

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("http://localhost:5000/api/courses");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setCourses(data);
          } else {
            setCourses(fallbackCourses);
          }
        } else {
          setCourses(fallbackCourses);
        }
      } catch (err) {
        console.error("Failed to fetch courses from backend, loading fallbacks:", err);
        setCourses(fallbackCourses);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  const formatLKR = (amount) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }).format(amount).replace("LKR", "Rs.");
  };

  return (
    <section id="courses" className="py-24 bg-slate-50 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-blue-600" />
            Our Curriculum
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Explore Professional Tech Courses
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed">
            Gain in-demand skills and accelerate your career path with our structured, production-ready modules & lessons.
          </p>
        </div>

        {/* Course Cards Grid */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm animate-pulse space-y-4 h-96">
                <div className="w-full h-44 bg-slate-200 rounded-xl" />
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-5/6" />
                <div className="h-10 bg-slate-200 rounded w-full mt-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {courses.map((course) => {
              const colors = [
                "from-blue-600 to-indigo-600",
                "from-cyan-500 to-blue-600",
                "from-indigo-600 to-purple-600"
              ];
              const randomGradient = colors[course.id % colors.length] || colors[0];

              return (
                <div
                  key={course.id}
                  className="group bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
                >
                  {/* Thumbnail / Accent Image */}
                  <div className="w-full h-48 relative shrink-0 overflow-hidden bg-slate-100">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-tr ${randomGradient} flex items-center justify-center text-white font-bold text-xl px-6 text-center`}>
                        {course.title.split(" ").slice(0, 3).join(" ")}
                      </div>
                    )}

                    {/* Price Tag Overlay */}
                    <div className="absolute top-4 right-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-3.5 py-1.5 rounded-full font-bold text-sm text-blue-600 dark:text-blue-400 shadow-md">
                      {formatLKR(course.price)}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
                        {course.title}
                      </h3>
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-4">
                        {course.description}
                      </p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      {/* Metric info */}
                      {/* <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                        <User className="w-4 h-4 text-slate-400" />
                        <span>{course.students || 0} active students enrolled</span>
                      </div> */}

                      {/* Enroll Button */}
                      <button
                        onClick={onEnrollClick}
                        className="w-full py-3 px-4 bg-slate-900 hover:bg-blue-600 text-white font-semibold rounded-xl hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-md hover:shadow-blue-500/20 cursor-pointer text-center"
                      >
                        Enroll Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
