import express from "express";
import { VerifyJwt } from "../../middlewares/jwt-token";
import commentsService from "./comments.service";
import { createCommentValidation } from "../../middlewares/handleValidation";

const router = express.Router();

router.post(
  "/create",
  createCommentValidation,
  VerifyJwt,
  commentsService.createComment
);

router.delete("/delete", VerifyJwt, commentsService.deleteComment);

router.get("/blog/:id", VerifyJwt, commentsService.showComment);

export default router;
