
  // Ensure production traffic always uses canonical domain student.anuradhaathukorala.site
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1' && host !== 'student.anuradhaathukorala.site') {
      if (host.includes('vercel.app') || host.includes('anuradhaathukorala.site')) {
        const canonicalUrl = `https://student.anuradhaathukorala.site${window.location.pathname}${window.location.search}${window.location.hash}`;
        window.location.replace(canonicalUrl);
      }
    }
  }

  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(<App />);
  