import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Moon, Sun, PenSquare, Menu, X, LogOut, User, LayoutDashboard } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export function Navbar() {
  const { user, logout, isAuthor } = useAuth();
  const { dark, toggleDark } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setProfileOpen(false);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive
        ? "text-brand-600 dark:text-brand-400"
        : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
    }`;

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <PenSquare className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">BlogSpace</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/" end className={navLinkClass}>Home</NavLink>
            <NavLink to="/posts" className={navLinkClass}>Posts</NavLink>
            {isAuthor && (
              <NavLink to="/dashboard/new-post" className={navLinkClass}>Write</NavLink>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDark}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen((o) => !o)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-semibold">
                      {user.username[0].toUpperCase()}
                    </div>
                  )}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name || user.username}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 font-medium">
                        {user.role}
                      </span>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 px-4 py-1.5 rounded-lg transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-2">
            <NavLink to="/" end className={navLinkClass} onClick={() => setMenuOpen(false)}>Home</NavLink>
            <NavLink to="/posts" className={navLinkClass} onClick={() => setMenuOpen(false)}>Posts</NavLink>
            {isAuthor && (
              <NavLink to="/dashboard/new-post" className={navLinkClass} onClick={() => setMenuOpen(false)}>Write</NavLink>
            )}
            {!user && (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" className="text-sm font-medium text-brand-600 dark:text-brand-400" onClick={() => setMenuOpen(false)}>Sign up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
