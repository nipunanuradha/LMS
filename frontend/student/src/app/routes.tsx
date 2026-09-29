import { createBrowserRouter } from "react-router";
import { Registration } from "./pages/Registration";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { CourseDetails } from "./pages/CourseDetails";
import { TermsOfService } from "./pages/TermsOfService";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { RefundPolicy } from "./pages/RefundPolicy";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Login },
      { path: "register", Component: Registration },
      { path: "dashboard", Component: Dashboard },
      { path: "course/:courseId", Component: CourseDetails },
      { path: "terms-of-service", Component: TermsOfService },
      { path: "privacy-policy", Component: PrivacyPolicy },
      { path: "refund-policy", Component: RefundPolicy },
    ],
  },
]);

