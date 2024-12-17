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

router.get("/all", VerifyJwt, blogsService.getAllBlogs);

router.get("/:id", VerifyJwt, blogsService.getSingleBlog);

router.delete("/:id", VerifyJwt, blogsService.deleteBlog);

router.get("/current/user", VerifyJwt, blogsService.currentUserBlogs);

router.put("/:id", VerifyJwt, blogsService.updateBlog);

export default router;
