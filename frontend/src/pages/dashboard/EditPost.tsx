import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, Send } from "lucide-react";
import api from "../../api/axios";
import { PostEditor } from "../../components/posts/PostEditor";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../../components/ui/Toast";

export default function EditPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    markdown: "",
    published: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get(`/posts/${id}`)
      .then(({ data }) => {
        const p = data.post;
        setForm({
          title: p.title,
          excerpt: p.excerpt || "",
          content: p.content,
          markdown: p.markdown || "",
          published: p.published,
        });
      })
      .catch(() => navigate("/dashboard/my-posts"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSubmit = async (publish: boolean) => {
    if (!form.title.trim()) { addToast("Title is required", "error"); return; }
    setSaving(true);
    try {
      const { data } = await api.put(`/posts/${id}`, { ...form, published: publish });
      addToast("Post updated!", "success");
      setTimeout(() => navigate(`/post/${data.post.slug}`), 1000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to update post";
      addToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Post</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSubmit(false)}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> Save Draft
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-brand-600 hover:bg-brand-700 text-white transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" /> {form.published ? "Update" : "Publish"}
            </button>
          </div>
        </div>

        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Post title..."
          className="w-full text-3xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600"
        />

        <input
          type="text"
          value={form.excerpt}
          onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
          placeholder="Short excerpt (optional)..."
          className="w-full text-base bg-transparent border-none outline-none text-gray-500 dark:text-gray-400 placeholder-gray-300 dark:placeholder-gray-600"
        />

        <PostEditor
          content={form.content}
          markdown={form.markdown}
          onContentChange={(html) => setForm((f) => ({ ...f, content: html }))}
          onMarkdownChange={(md) => setForm((f) => ({ ...f, markdown: md }))}
        />
      </div>
    </>
  );
}
