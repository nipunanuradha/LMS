import { Outlet } from "react-router";
import ChatWidget from "./ChatWidget";

export function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <Outlet />
      <ChatWidget />
    </div>
  );
}
