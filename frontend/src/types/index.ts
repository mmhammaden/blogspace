export type Role = "READER" | "AUTHOR" | "ADMIN";

export interface User {
  id: string;
  email: string;
  username: string;
  role: Role;
  name?: string | null;
  avatar?: string | null;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  markdown?: string | null;
  excerpt?: string | null;
  published: boolean;
  authorId: string;
  author: Pick<User, "id" | "username" | "name" | "avatar">;
  likes: number;
  dislikes: number;
  createdAt: string;
  updatedAt: string;
  _count?: { comments: number };
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  author: Pick<User, "id" | "username" | "name" | "avatar">;
  createdAt: string;
}

export interface PaginatedPosts {
  posts: Post[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}
