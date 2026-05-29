import { Router } from "express";
import {
  getPosts,
  searchPosts,
  getPostBySlug,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getMyPosts,
  likePost,
} from "../controllers/post.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { createPostSchema, updatePostSchema } from "../schemas/post.schema";

const router = Router();

router.get("/", getPosts);
router.get("/search", searchPosts);
router.get("/my-posts", authenticate, getMyPosts);
router.get("/slug/:slug", getPostBySlug);
router.get("/:id", getPostById);

router.post(
  "/",
  authenticate,
  requireRole("AUTHOR", "ADMIN"),
  validate(createPostSchema),
  createPost
);

router.put(
  "/:id",
  authenticate,
  requireRole("AUTHOR", "ADMIN"),
  validate(updatePostSchema),
  updatePost
);

router.delete("/:id", authenticate, deletePost);

router.post("/:id/react", authenticate, likePost);

export default router;
