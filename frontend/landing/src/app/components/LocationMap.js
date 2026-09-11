"use client";

import { MapPin, Navigation, Clock, Phone, ExternalLink } from "lucide-react";

export default function LocationMap() {
  const address = "98 High Level Rd, Nawagamuwa, Kaduwela, Sri Lanka";
  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address
  )}`;
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    address
  )}`;

  // Google Maps Embed iframe source URL
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    address
  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <section id="location" className="py-20 bg-slate-50 relative border-t border-slate-200/70">
      {/* Background subtle glowing radial accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100/80 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            Find Our Campus
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Visit Us at{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              ICT Academy
            </span>
          </h2>
          <p className="mt-3 text-slate-600 text-base sm:text-lg">
            Easily accessible via High Level Road. Drop by to explore our modern learning labs, consult our instructors, or register in person.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid lg:grid-cols-12">
          {/* Left Info Panel */}
          <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between bg-gradient-to-b from-white to-slate-50/50">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                  Headquarters & Classrooms
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  Main Academic Campus
                </h3>
              </div>

              {/* Address Highlight Box */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-slate-800">
                <div className="p-3 bg-blue-600 text-white rounded-xl shadow-sm shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Campus Address</h4>
                  <p className="text-sm text-slate-700 mt-0.5 leading-relaxed font-medium">
                    {address}
                  </p>
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 shrink-0">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Visiting & Counseling Hours
                    </h5>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">
                      Mon – Fri: 8:30 AM – 5:30 PM
                    </p>
                    <p className="text-xs text-slate-500">
                      Sat: 9:00 AM – 4:00 PM | Sun: Closed
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 shrink-0">
                    <Phone className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Direct Hotlines
                    </h5>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">
                      +94 705688895 / +94 781066642
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direction Action Buttons */}
            <div className="pt-8 mt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              <a
                href={googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-md shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer text-center"
              >
                <Navigation className="w-4 h-4" />
                Get Directions
              </a>
              <a
                href={googleMapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:text-blue-600 transition-all cursor-pointer"
              >
                Open in Maps
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right Interactive Google Map */}
          <div className="lg:col-span-7 h-[380px] sm:h-[450px] lg:h-auto min-h-[380px] relative bg-slate-100">
            <iframe
              title="ICT Academy Location Map"
              src={embedUrl}
              className="w-full h-full border-0 absolute inset-0"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
