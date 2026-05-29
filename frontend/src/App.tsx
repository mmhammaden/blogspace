import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Layout } from "./components/layout/Layout";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";

// Pages
import Home from "./pages/Home";
import Posts from "./pages/Posts";
import PostDetail from "./pages/PostDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Dashboard from "./pages/dashboard/Dashboard";
import NewPost from "./pages/dashboard/NewPost";
import MyPosts from "./pages/dashboard/MyPosts";
import EditPost from "./pages/dashboard/EditPost";

function ProtectedRoute({ children, requireAuthor = false }: { children: JSX.Element; requireAuthor?: boolean }) {
  const { user, loading, isAuthor } = useAuth();

  if (loading) return <LoadingSpinner size="lg" />;
  if (!user) return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  if (requireAuthor && !isAuthor) return <Navigate to="/dashboard" replace />;

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/post/:slug" element={<PostDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/profile"
          element={<ProtectedRoute><Profile /></ProtectedRoute>}
        />

        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        >
          <Route
            path="new-post"
            element={<ProtectedRoute requireAuthor><NewPost /></ProtectedRoute>}
          />
          <Route
            path="my-posts"
            element={<ProtectedRoute requireAuthor><MyPosts /></ProtectedRoute>}
          />
          <Route
            path="edit/:id"
            element={<ProtectedRoute requireAuthor><EditPost /></ProtectedRoute>}
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
