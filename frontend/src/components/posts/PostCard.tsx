import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, ThumbsUp, ThumbsDown, Clock } from "lucide-react";
import { Post } from "../../types";

interface PostCardProps {
  post: Post;
  featured?: boolean;
}

export function PostCard({ post, featured = false }: PostCardProps) {
  const authorName = post.author.name || post.author.username;
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  if (featured) {
    return (
      <Link to={`/post/${post.slug}`} className="group block">
        <article className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900 p-8 text-white h-full min-h-[280px] flex flex-col justify-end hover:shadow-2xl transition-shadow">
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
          <div className="relative z-10">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-brand-200 mb-3">
              Featured
            </span>
            <h2 className="text-2xl font-bold mb-3 line-clamp-2 group-hover:underline decoration-2 underline-offset-2">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="text-brand-100 text-sm line-clamp-2 mb-4">{post.excerpt}</p>
            )}
            <div className="flex items-center gap-4 text-brand-200 text-xs">
              <span className="font-medium text-white">{authorName}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo}</span>
              {post._count && (
                <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{post._count.comments}</span>
              )}
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link to={`/post/${post.slug}`} className="group block">
      <article className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md hover:border-brand-200 dark:hover:border-brand-800 transition-all h-full flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
            {authorName[0].toUpperCase()}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">{authorName}</span>
          <span className="text-gray-300 dark:text-gray-600">·</span>
          <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />{timeAgo}
          </span>
        </div>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors flex-1">
          {post.title}
        </h2>

        {post.excerpt && (
          <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4">{post.excerpt}</p>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
          {post._count && (
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" />{post._count.comments} comments
            </span>
          )}
          <span className="flex items-center gap-1">
            <ThumbsUp className="w-3.5 h-3.5" />{post.likes}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsDown className="w-3.5 h-3.5" />{post.dislikes}
          </span>
        </div>
      </article>
    </Link>
  );
}
