import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "../components/Sidebar";

export const metadata: Metadata = {
  title: "Mantaga Mission Control",
  description: "AI-powered operations dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex min-h-screen">
          {/* Desktop Sidebar - hidden on mobile */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>
          
          {/* Main Content */}
          <main className="flex-1 lg:ml-56 min-h-screen bg-gray-50 dark:bg-black">
            {/* Mobile Header */}
            <header className="lg:hidden sticky top-0 z-40 h-14 bg-white dark:bg-[#1C1C1E] border-b border-gray-200 dark:border-gray-800 flex items-center px-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">M</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">Mantaga</span>
              </div>
            </header>
            
            {/* Page Content */}
            <div className="p-4 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
