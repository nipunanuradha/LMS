import { createBrowserRouter } from "react-router";
import { Registration } from "./pages/Registration";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { CourseDetails } from "./pages/CourseDetails";
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
    ],
  },
]);
