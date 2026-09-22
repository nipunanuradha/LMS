"use client";

import { Award, Users, FlaskConical, Target } from "lucide-react";

export default function About() {
  const cards = [
    {
      title: "Expert Tutors",
      description: "Learn from seasoned professionals with years of real-world industry experience. Our educators don't just teach theory; they share actual engineering practices.",
      icon: Users,
      color: "from-blue-500 to-indigo-500",
      accentBg: "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400",
    },
    {
      title: "Hands-on Labs",
      description: "Get practical training with cloud-based sandboxes, live code sessions, and hardware simulation labs. We believe in learning by doing, not memorizing.",
      icon: FlaskConical,
      color: "from-cyan-500 to-teal-500",
      accentBg: "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400",
    },
    {
      title: "Exam & Career Success",
      description: "Prepare with simulated exams, customized certification guides, and job placement assistance. Our curriculum is tailored for instant career readiness.",
      icon: Award,
      color: "from-purple-500 to-pink-500",
      accentBg: "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <section id="about" className="py-24 bg-white dark:bg-slate-900/60 relative transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold uppercase tracking-wider">
            <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Why Choose Us
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
            A Better Way to Learn Technology
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
            We provide a comprehensive ecosystem built to bridge the gap between classroom teaching and the current needs of the global tech industry.
          </p>
        </div>

        {/* 3-Card Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="group relative bg-slate-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700/60 hover:border-slate-200 dark:hover:border-slate-600 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Icon badge */}
                  <div className={`inline-flex items-center justify-center p-3 rounded-xl ${card.accentBg} mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Decorative border accent on hover */}
                <div className={`absolute bottom-0 left-0 right-0 h-1.5 rounded-b-2xl bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
