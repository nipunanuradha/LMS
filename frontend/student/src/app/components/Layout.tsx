import { Outlet } from "react-router";
import ChatWidget from "./ChatWidget";

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
      <ChatWidget />
    </div>
  );
}
