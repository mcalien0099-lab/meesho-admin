"use client";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { usePathname } from "next/navigation";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/';

  if (isLoginPage) {
    return <main className="min-h-screen bg-background text-foreground font-sans">{children}</main>;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 transition-all duration-300">
        <Navbar />
        <main className="flex-1 p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
