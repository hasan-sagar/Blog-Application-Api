import express from "express";
import likesService from "./likes.service";
import { VerifyJwt } from "../../middlewares/jwt-token";
import {
  createLikeValidation,
  unlikeBlogValidation,
} from "../../middlewares/handleValidation";
const router = express.Router();

router.post(
  "/create",
  createLikeValidation,
  VerifyJwt,
  likesService.createLike
);

router.delete(
  "/unlike",
  unlikeBlogValidation,
  VerifyJwt,
  likesService.unlikeBlog
);

router.get("/blog/:id", VerifyJwt, likesService.getBlogLikes);

router.get("/user/blog", VerifyJwt, likesService.getUsersLikedBlogs);

export default router;
