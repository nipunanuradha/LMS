import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata = {
  title: "ICT Academy | High-Quality Tech Education & LMS Portal",
  description: "Level up your technical skills with our professional certifications, expert mentors, and hands-on labs. Explore courses and access your student LMS portal.",
  icons: {
    icon: "/favicon.svg",
  },
  verification: {
    google: "opk3GGBagoPn96sfbmaPyjtWqkaMSJynWOGrVDKkzqE",
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "ICT Academy",
    "url": "https://ict-academy-sooty.vercel.app",
    "logo": "https://ict-academy-sooty.vercel.app/favicon.svg",
    "description": "Level up your technical skills with our professional certifications, expert mentors, and hands-on labs. Explore courses and access your student LMS portal.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "98 High Level Rd, Nawagamuwa",
      "addressLocality": "Kaduwela",
      "addressCountry": "LK"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+94 705688895",
      "contactType": "customer service"
    }
  };

  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} scroll-smooth antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans bg-slate-50 text-slate-900 min-h-screen selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
