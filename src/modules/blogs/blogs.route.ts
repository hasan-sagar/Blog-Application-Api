import express from "express";
import blogsService from "./blogs.service";
import { VerifyJwt } from "../../middlewares/jwt-token";
import { createBlogValidation } from "../../middlewares/handleValidation";

const router = express.Router();

router.post(
  "/create",
  createBlogValidation,
  VerifyJwt,
  blogsService.createBlog
);

export default router;
