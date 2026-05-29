import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp } from "lucide-react";
import api from "../api/axios";
import { Post } from "../types";
import { PostCard } from "../components/posts/PostCard";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { EmptyState } from "../components/ui/EmptyState";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/posts?limit=7")
      .then(({ data }) => setPosts(data.posts))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  const [featured, ...recent] = posts;

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center py-12">
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
          Welcome to{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600">
            BlogSpace
          </span>
        </h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8">
          A modern platform for writers and readers. Discover stories, share ideas, and connect with a community.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/posts"
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors"
          >
            Explore Posts
          </Link>
          <Link
            to="/register"
            className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold rounded-xl transition-colors"
          >
            Start Writing
          </Link>
        </div>
      </section>

      {posts.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description="Be the first to share your story on BlogSpace."
          action={
            <Link to="/register" className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">
              Get Started
            </Link>
          }
        />
      ) : (
        <>
          {/* Featured post */}
          {featured && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Featured</h2>
              </div>
              <PostCard post={featured} featured />
            </section>
          )}

          {/* Recent posts */}
          {recent.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Posts</h2>
                <Link
                  to="/posts"
                  className="flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400 hover:underline font-medium"
                >
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recent.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
