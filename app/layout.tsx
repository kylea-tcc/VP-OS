import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav/Nav";

export const metadata: Metadata = {
  title: "VP OS — Sales Command Center",
  description: "Personal operating system for VP of Sales at The Change Companies",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg-base text-ink-1 antialiased">
        <div className="flex h-dvh overflow-hidden">
          {/* Sidebar nav — desktop */}
          <Nav />

          {/* Main content */}
          <main className="flex-1 overflow-y-auto min-w-0">
            <div className="min-h-full">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
