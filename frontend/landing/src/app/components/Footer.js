"use client";

import { GraduationCap, Mail, Phone, MapPin, Facebook, Youtube, Linkedin, Globe } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Logo & About */}
          <div className="space-y-4">
            <a href="/#home" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400">
                <GraduationCap className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-white">
                ICT Academy
              </span>
            </a>
            <p className="text-sm text-slate-500 leading-relaxed">
              Pioneering tech education and standard certification training in Sri Lanka. Connecting ambitions to actions.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4">
              <a href="https://www.facebook.com/share/18k2vc3S6s/" className="p-2 rounded-lg bg-slate-900 hover:bg-blue-600 hover:text-white transition-all">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://www.youtube.com/@athukoralanipun" className="p-2 rounded-lg bg-slate-900 hover:bg-blue-600 hover:text-white transition-all">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="https://www.linkedin.com/in/anuradha-athukorala/" className="p-2 rounded-lg bg-slate-900 hover:bg-blue-600 hover:text-white transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-900 hover:bg-blue-600 hover:text-white transition-all">
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="/#home" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="/#about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="/#courses" className="hover:text-white transition-colors">All Courses</a></li>
              <li><a href="/#faculty" className="hover:text-white transition-colors">Testimonials</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Contact Info</h4>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>+94 705688895</span>
                <span>+94 781066642</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>academyict3@gmail.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>98 High Level Rd, Nawagamuwa, Kaduwela, Sri Lanka</span>
              </li>
            </ul>
          </div>

          {/* Legal/Hours */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Office Hours</h4>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li>Monday – Friday: 8:30 AM – 5:30 PM</li>
              <li>Saturday: 9:00 AM – 4:00 PM</li>
              <li>Sunday: Closed</li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <p>&copy; {currentYear} ICT Academy. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="/privacy-policy" className="hover:text-slate-400">Privacy Policy</a>
            <span>•</span>
            <a href="/terms-of-service" className="hover:text-slate-400">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
