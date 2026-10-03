import { Outlet } from "react-router";
import ChatWidget from "./ChatWidget";
import { useAutoLogout } from "../hooks/useAutoLogout";

export function Layout() {
  useAutoLogout();

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <Outlet />
      <ChatWidget />
    </div>
  );
}
