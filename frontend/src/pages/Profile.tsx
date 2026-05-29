import { useState, FormEvent } from "react";
import { User, Mail, AtSign, Shield, Camera } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ui/Toast";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [form, setForm] = useState({ name: user?.name || "", avatar: user?.avatar || "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch("/auth/profile", form);
      updateUser(data.user);
      addToast("Profile updated!", "success");
    } catch {
      addToast("Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="max-w-lg mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>

        {/* Avatar preview */}
        <div className="flex items-center gap-4">
          <div className="relative">
            {form.avatar ? (
              <img src={form.avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-md" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-brand-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-white dark:border-gray-800 shadow-md">
                {user.username[0].toUpperCase()}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
              <Camera className="w-3 h-3 text-gray-500" />
            </div>
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{user.name || user.username}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
          </div>
        </div>

        {/* Read-only info */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <AtSign className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500 dark:text-gray-400 w-20">Username</span>
            <span className="font-medium text-gray-900 dark:text-white">{user.username}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500 dark:text-gray-400 w-20">Email</span>
            <span className="font-medium text-gray-900 dark:text-white">{user.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Shield className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500 dark:text-gray-400 w-20">Role</span>
            <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 font-medium">
              {user.role}
            </span>
          </div>
        </div>

        {/* Editable form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Edit Profile</h2>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <User className="w-4 h-4" /> Display Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              placeholder="Your display name"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <Camera className="w-4 h-4" /> Avatar URL
            </label>
            <input
              type="url"
              value={form.avatar}
              onChange={(e) => setForm((f) => ({ ...f, avatar: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </>
  );
}
