import { useState, useEffect, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Send, MessageCircle } from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { Comment } from "../../types";
import { LoadingSpinner } from "../ui/LoadingSpinner";

interface CommentSectionProps {
  postId: string;
  onToast: (msg: string, type: "success" | "error") => void;
}

export function CommentSection({ postId, onToast }: CommentSectionProps) {
  const { user, isAdmin } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const { data } = await api.get(`/posts/${postId}/comments`);
      setComments(data.comments);
    } catch {
      onToast("Failed to load comments", "error");
    } finally {
      setLoading(false);
    }
  }, [postId, onToast]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, { content });
      setComments((prev) => [...prev, data.comment]);
      setContent("");
      onToast("Comment posted!", "success");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to post comment";
      onToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/comments/${id}`);
      setComments((prev) => prev.filter((c) => c.id !== id));
      onToast("Comment deleted", "success");
    } catch {
      onToast("Failed to delete comment", "error");
    }
  };

  return (
    <section className="mt-12">
      <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white mb-6">
        <MessageCircle className="w-5 h-5" />
        Comments ({comments.length})
      </h2>

      {/* Comment form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none text-sm"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={submitting || !content.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
          <a href="/login" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">Sign in</a> to leave a comment
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <LoadingSpinner />
      ) : comments.length === 0 ? (
        <p className="text-center text-gray-400 dark:text-gray-500 py-8">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const canDelete = user?.id === comment.authorId || isAdmin;
            const authorName = comment.author.name || comment.author.username;
            return (
              <div key={comment.id} className="flex gap-3 group">
                <div className="w-9 h-9 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 text-sm font-semibold shrink-0">
                  {authorName[0].toUpperCase()}
                </div>
                <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{authorName}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-all"
                        title="Delete comment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
