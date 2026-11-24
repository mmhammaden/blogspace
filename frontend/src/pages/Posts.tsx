import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import api from "../api/axios";
import { Post, PaginatedPosts } from "../types";
import { PostCard } from "../components/posts/PostCard";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { EmptyState } from "../components/ui/EmptyState";

type PostResponse = PaginatedPosts | { posts: Post[] };
type PostRequest = { page: number; query: string };
type PostResult = { request: PostRequest; data: PostResponse | null };

export default function Posts() {
  const [query, setQuery] = useState("");
  const [request, setRequest] = useState<PostRequest>({ page: 1, query: "" });
  const [result, setResult] = useState<PostResult | null>(null);
  const { page, query: submittedQuery } = request;

  useEffect(() => {
    const controller = new AbortController();
    const endpoint = request.query ? "/posts/search" : "/posts";
    const params = request.query ? { q: request.query } : { page: request.page, limit: 9 };
    void api.get<PostResponse>(endpoint, { params, signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) setResult({ request, data });
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult({ request, data: null });
      });

    return () => controller.abort();
  }, [request]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setRequest({ page, query: query.trim() });
  };

  const clearSearch = () => {
    setQuery("");
    if (submittedQuery) setRequest({ page, query: "" });
  };

  const currentResult = result?.request === request ? result : null;
  const data = currentResult?.data;
  const displayPosts = data?.posts ?? [];
  const pagination = !submittedQuery && data && "totalPages" in data ? data : null;

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
              aria-label="Search posts"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
            {(query || submittedQuery) && (
              <button type="button" aria-label="Clear search" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {submittedQuery && data && (
        <p role="status" className="text-sm text-gray-500 dark:text-gray-400">
          {displayPosts.length} result{displayPosts.length !== 1 ? "s" : ""} for "{submittedQuery}"
        </p>
      )}

      {!currentResult ? (
        <LoadingSpinner size="lg" />
      ) : !data ? (
        <div className="space-y-3 py-8 text-center">
          <p role="alert">{submittedQuery ? "Could not search posts." : "Could not load posts."}</p>
          <button
            type="button"
            onClick={() => setRequest({ ...request })}
            className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            Try again
          </button>
        </div>
      ) : displayPosts.length === 0 ? (
        <EmptyState
          title={submittedQuery ? "No results found" : "No posts yet"}
          description={submittedQuery ? "Try a different search term." : "Check back soon for new content."}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setRequest({ page: page - 1, query: "" })}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setRequest({ page: page + 1, query: "" })}
            disabled={page === pagination.totalPages}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
