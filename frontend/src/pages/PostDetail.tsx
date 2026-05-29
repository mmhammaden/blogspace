import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp, ThumbsDown, Edit, Trash2, ArrowLeft, Clock, User } from "lucide-react";
import api from "../api/axios";
import { Post } from "../types";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ui/Toast";
import { CommentSection } from "../components/comments/CommentSection";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [reacting, setReacting] = useState(false);

  const fetchPost = useCallback(async () => {
    try {
      const { data } = await api.get(`/posts/slug/${slug}`);
      setPost(data.post);
    } catch {
      navigate("/posts", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [slug, navigate]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleReact = async (action: "like" | "dislike") => {
    if (!user) { addToast("Sign in to react to posts", "info"); return; }
    if (!post || reacting) return;
    setReacting(true);
    try {
      const { data } = await api.post(`/posts/${post.id}/react`, { action });
      setPost((p) => p ? { ...p, likes: data.likes, dislikes: data.dislikes } : p);
    } catch {
      addToast("Failed to react", "error");
    } finally {
      setReacting(false);
    }
  };

  const handleDelete = async () => {
    if (!post || !confirm("Delete this post permanently?")) return;
    try {
      await api.delete(`/posts/${post.id}`);
      addToast("Post deleted", "success");
      navigate("/posts");
    } catch {
      addToast("Failed to delete post", "error");
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;
  if (!post) return null;

  const canEdit = user?.id === post.authorId || isAdmin;
  const authorName = post.author.name || post.author.username;

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <article className="max-w-3xl mx-auto">
        {/* Back */}
        <Link
          to="/posts"
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to posts
        </Link>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-semibold">
                {authorName[0].toUpperCase()}
              </div>
              <div>
                <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
                  <User className="w-3.5 h-3.5" /> {authorName}
                </span>
              </div>
            </div>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>

            {canEdit && (
              <div className="ml-auto flex items-center gap-2">
                <Link
                  to={`/dashboard/edit/${post.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <div
          className="prose prose-gray dark:prose-invert max-w-none mb-10"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Like / Dislike */}
        <div className="flex items-center gap-3 py-6 border-t border-b border-gray-200 dark:border-gray-800 mb-10">
          <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Was this helpful?</span>
          <button
            onClick={() => handleReact("like")}
            disabled={reacting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition-all text-sm font-medium disabled:opacity-50"
          >
            <ThumbsUp className="w-4 h-4" /> {post.likes}
          </button>
          <button
            onClick={() => handleReact("dislike")}
            disabled={reacting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all text-sm font-medium disabled:opacity-50"
          >
            <ThumbsDown className="w-4 h-4" /> {post.dislikes}
          </button>
        </div>

        {/* Comments */}
        <CommentSection postId={post.id} onToast={addToast} />
      </article>
    </>
  );
}
