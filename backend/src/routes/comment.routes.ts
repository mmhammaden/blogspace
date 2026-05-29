import { Router } from "express";
import rateLimit from "express-rate-limit";
import { getComments, createComment, deleteComment } from "../controllers/comment.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { createCommentSchema } from "../schemas/comment.schema";

const router = Router({ mergeParams: true });

const commentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: "Too many comments, slow down" },
});

router.get("/posts/:postId/comments", getComments);
router.post(
  "/posts/:postId/comments",
  authenticate,
  commentLimiter,
  validate(createCommentSchema),
  createComment
);
router.delete("/comments/:id", authenticate, deleteComment);

export default router;
