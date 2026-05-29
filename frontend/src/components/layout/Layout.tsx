import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="mt-16 border-t border-gray-200 dark:border-gray-800 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} BlogSpace. Built with ❤️ using React & Node.js
      </footer>
    </div>
  );
}
