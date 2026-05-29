import { Link, Outlet, useLocation, NavLink } from "react-router-dom";
import { PenSquare, FileText, LayoutDashboard } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const { user, isAuthor } = useAuth();
  const location = useLocation();
  const isDashboardRoot = location.pathname === "/dashboard";

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? "bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300"
        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
    }`;

  return (
    <div className="flex gap-8">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 hidden md:block">
        <div className="sticky top-24 space-y-1">
          <NavLink to="/dashboard" end className={navClass}>
            <LayoutDashboard className="w-4 h-4" /> Overview
          </NavLink>
          {isAuthor && (
            <>
              <NavLink to="/dashboard/new-post" className={navClass}>
                <PenSquare className="w-4 h-4" /> New Post
              </NavLink>
              <NavLink to="/dashboard/my-posts" className={navClass}>
                <FileText className="w-4 h-4" /> My Posts
              </NavLink>
            </>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {isDashboardRoot ? (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.name || user?.username}!
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Role: <span className="font-medium text-brand-600 dark:text-brand-400">{user?.role}</span>
              </p>
            </div>

            {isAuthor ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  to="/dashboard/new-post"
                  className="flex items-center gap-4 p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-sm transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center group-hover:bg-brand-600 transition-colors">
                    <PenSquare className="w-6 h-6 text-brand-600 dark:text-brand-400 group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Write New Post</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Share your ideas</p>
                  </div>
                </Link>

                <Link
                  to="/dashboard/my-posts"
                  className="flex items-center gap-4 p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-sm transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                    <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400 group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">My Posts</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage your content</p>
                  </div>
                </Link>
              </div>
            ) : (
              <div className="p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <p className="text-amber-800 dark:text-amber-300 text-sm">
                  You have the <strong>READER</strong> role. Contact an admin to become an Author and start writing posts.
                </p>
              </div>
            )}
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
}
