import { Request, Response, NextFunction } from "express";
import sanitizeHtml from "sanitize-html";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { generateUniqueSlug } from "../utils/slug";
import { CreatePostInput, UpdatePostInput } from "../schemas/post.schema";

const AUTHOR_SELECT = {
  id: true,
  username: true,
  name: true,
  avatar: true,
};

const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "iframe"]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "alt", "width", "height"],
    iframe: ["src", "width", "height", "frameborder", "allowfullscreen"],
    // avoid allowing arbitrary styles which can be abused via XSS
    "*": ["class"],
  },
};

export async function getPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(20, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;

    const [posts, total] = await prisma.$transaction([
      prisma.post.findMany({
        where: { published: true },
        include: { author: { select: AUTHOR_SELECT }, _count: { select: { comments: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.post.count({ where: { published: true } }),
    ]);

    res.json({ posts, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}

export async function searchPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const q = (req.query.q as string)?.trim();
    if (!q) {
      res.status(400).json({ message: "Search query is required" });
      return;
    }

    const posts = await prisma.post.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { excerpt: { contains: q, mode: "insensitive" } },
        ],
      },
      include: { author: { select: AUTHOR_SELECT }, _count: { select: { comments: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    res.json({ posts });
  } catch (err) {
    next(err);
  }
}

export async function getPostBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await prisma.post.findUnique({
      where: { slug: req.params.slug },
      include: { author: { select: AUTHOR_SELECT }, _count: { select: { comments: true } } },
    });

    if (!post || !post.published) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    res.json({ post });
  } catch (err) {
    next(err);
  }
}

export async function getPostById(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: { author: { select: AUTHOR_SELECT } },
    });

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    res.json({ post });
  } catch (err) {
    next(err);
  }
}

export async function createPost(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { title, content, markdown, excerpt, published } = req.body as CreatePostInput;

    const slug = await generateUniqueSlug(title);
    const sanitized = sanitizeHtml(content, sanitizeOptions);

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content: sanitized,
        markdown,
        excerpt,
        published: published ?? false,
        authorId: req.user!.id,
      },
      include: { author: { select: AUTHOR_SELECT } },
    });

    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
}

export async function updatePost(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    if (post.authorId !== req.user!.id && req.user!.role !== "ADMIN") {
      res.status(403).json({ message: "Not authorized to edit this post" });
      return;
    }

    const { title, content, markdown, excerpt, published } = req.body as UpdatePostInput;

    const slug = title && title !== post.title ? await generateUniqueSlug(title) : post.slug;
    const sanitized = content ? sanitizeHtml(content, sanitizeOptions) : post.content;

    const data: any = {};
    if (title !== undefined) data.title = title;
    if (slug !== undefined) data.slug = slug;
    if (content !== undefined) data.content = sanitized;
    if (markdown !== undefined) data.markdown = markdown;
    if (excerpt !== undefined) data.excerpt = excerpt;
    if (published !== undefined) data.published = published;

    const updated = await prisma.post.update({
      where: { id: req.params.id },
      data,
      include: { author: { select: AUTHOR_SELECT } },
    });

    res.json({ post: updated });
  } catch (err) {
    next(err);
  }
}

export async function deletePost(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    if (post.authorId !== req.user!.id && req.user!.role !== "ADMIN") {
      res.status(403).json({ message: "Not authorized to delete this post" });
      return;
    }

    await prisma.post.delete({ where: { id: req.params.id } });
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    next(err);
  }
}

export async function getMyPosts(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      where: { authorId: req.user!.id },
      include: { _count: { select: { comments: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });
    res.json({ posts, page, limit });
  } catch (err) {
    next(err);
  }
}

export async function likePost(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { action } = req.body as { action: "like" | "dislike" };
    if (!["like", "dislike"].includes(action)) {
      res.status(400).json({ message: "Action must be like or dislike" });
      return;
    }

    const post = await prisma.post.update({
      where: { id: req.params.id },
      data: action === "like" ? { likes: { increment: 1 } } : { dislikes: { increment: 1 } },
      select: { likes: true, dislikes: true },
    });

    res.json(post);
  } catch (err) {
    next(err);
  }
}
