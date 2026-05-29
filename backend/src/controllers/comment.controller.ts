import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { CreateCommentInput } from "../schemas/comment.schema";

export async function getComments(req: Request, res: Response) {
  const comments = await prisma.comment.findMany({
    where: { postId: req.params.postId },
    include: { author: { select: { id: true, username: true, name: true, avatar: true } } },
    orderBy: { createdAt: "asc" },
  });
  res.json({ comments });
}

export async function createComment(req: AuthRequest, res: Response) {
  const post = await prisma.post.findUnique({
    where: { id: req.params.postId, published: true },
  });

  if (!post) {
    res.status(404).json({ message: "Post not found" });
    return;
  }

  const { content } = req.body as CreateCommentInput;

  const comment = await prisma.comment.create({
    data: { content, postId: req.params.postId, authorId: req.user!.id },
    include: { author: { select: { id: true, username: true, name: true, avatar: true } } },
  });

  res.status(201).json({ comment });
}

export async function deleteComment(req: AuthRequest, res: Response) {
  const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });

  if (!comment) {
    res.status(404).json({ message: "Comment not found" });
    return;
  }

  if (comment.authorId !== req.user!.id && req.user!.role !== "ADMIN") {
    res.status(403).json({ message: "Not authorized to delete this comment" });
    return;
  }

  await prisma.comment.delete({ where: { id: req.params.id } });
  res.json({ message: "Comment deleted" });
}
