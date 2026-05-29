import { useState, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import api from "../api/axios";
import { Post, PaginatedPosts } from "../types";
import { PostCard } from "../components/posts/PostCard";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { EmptyState } from "../components/ui/EmptyState";

export default function Posts() {
  const [data, setData] = useState<PaginatedPosts | null>(null);
  const [searchResults, setSearchResults] = useState<Post[] | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const fetchPosts = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const { data: res } = await api.get(`/posts?page=${p}&limit=9`);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(page);
  }, [page, fetchPosts]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    try {
      const { data: res } = await api.get(`/posts/search?q=${encodeURIComponent(query)}`);
      setSearchResults(res.posts);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setSearchResults(null);
  };

  const displayPosts = searchResults ?? data?.posts ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Posts</h1>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
            {query && (
              <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {searching ? "..." : "Search"}
          </button>
        </form>
      </div>

      {searchResults !== null && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for "{query}"
          <button onClick={clearSearch} className="ml-2 text-brand-600 dark:text-brand-400 hover:underline">Clear</button>
        </p>
      )}

      {loading ? (
        <LoadingSpinner size="lg" />
      ) : displayPosts.length === 0 ? (
        <EmptyState
          title={searchResults !== null ? "No results found" : "No posts yet"}
          description={searchResults !== null ? `Try a different search term.` : "Check back soon for new content."}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!searchResults && data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page {data.page} of {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
