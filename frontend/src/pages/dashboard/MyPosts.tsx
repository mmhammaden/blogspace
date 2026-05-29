import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Edit, Trash2, Eye, EyeOff, PenSquare, MessageCircle, ThumbsUp } from "lucide-react";
import api from "../../api/axios";
import { Post } from "../../types";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../../components/ui/Toast";

export default function MyPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    api
      .get("/posts/my-posts")
      .then(({ data }) => setPosts(data.posts))
      .catch(() => addToast("Failed to load posts", "error"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post permanently?")) return;
    try {
      await api.delete(`/posts/${id}`);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      addToast("Post deleted", "success");
    } catch {
      addToast("Failed to delete post", "error");
    }
  };

  const handleTogglePublish = async (post: Post) => {
    try {
      const { data } = await api.put(`/posts/${post.id}`, { published: !post.published });
      setPosts((prev) => prev.map((p) => (p.id === post.id ? data.post : p)));
      addToast(data.post.published ? "Post published!" : "Post unpublished", "success");
    } catch {
      addToast("Failed to update post", "error");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Posts</h1>
          <Link
            to="/dashboard/new-post"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-brand-600 hover:bg-brand-700 text-white transition-colors"
          >
            <PenSquare className="w-4 h-4" /> New Post
          </Link>
        </div>

        {posts.length === 0 ? (
          <EmptyState
            title="No posts yet"
            description="Start writing your first post!"
            action={
              <Link to="/dashboard/new-post" className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">
                Write Post
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                        post.published
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {post.published ? "Published" : "Draft"}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true })}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{post.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 dark:text-gray-500">
                    {post._count && (
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" /> {post._count.comments}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" /> {post.likes}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleTogglePublish(post)}
                    title={post.published ? "Unpublish" : "Publish"}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    {post.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <Link
                    to={`/dashboard/edit/${post.id}`}
                    className="p-2 rounded-lg text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
