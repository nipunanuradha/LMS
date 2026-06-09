"use client";

import { Star, MessageSquare } from "lucide-react";

export default function Testimonials() {
  const reviews = [
    {
      name: "Nethum Hemesha",
      role: "Student",
      company: "Ict Academy",
      rating: 5,
      content: "The Hands-on Labs and practical coding tasks made a huge difference. I transitioned from zero coding knowledge to landing an engineering job in Sri Lanka's top tech firm in just 8 months!",
    },
    {
      name: "Bashitha",
      role: "Student",
      company: "Ict Academy",
      rating: 5,
      content: "Preparing for CCNA here was an amazing experience. The instructor explained very complex networking topics in an incredibly simple way. The exam preparation tools helped me clear my test on my first attempt.",
    },
    {
      name: "Sahan Sathsara",
      role: "Student",
      company: "Ict Academy",
      rating: 5,
      content: "The LMS portal is extremely responsive. Having immediate access to video recordings, notes, and PDF study guides is a massive advantage when revising for academy assessments.",
    },
  ];

  return (
    <section id="Stories" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold uppercase tracking-wider">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            Success Stories
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Loved By Thousands of Students
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed">
            Read how our comprehensive curriculum, expert support, and practical LMS platform help students achieve their goals.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-slate-50 border border-slate-100 p-8 rounded-2xl flex flex-col justify-between hover:shadow-lg transition-all duration-300"
            >
              {/* Rating stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-slate-600 italic text-sm sm:text-base leading-relaxed mb-6">
                "{rev.content}"
              </p>

              {/* Author details */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200/50">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
                  {rev.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{rev.name}</h4>
                  <p className="text-xs text-slate-500">{rev.role} at {rev.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
