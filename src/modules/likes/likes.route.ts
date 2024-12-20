import express from "express";
import likesService from "./likes.service";
import { VerifyJwt } from "../../middlewares/jwt-token";
const router = express.Router();

router.post("/create", VerifyJwt, likesService.createLike);
router.delete("/unlike", VerifyJwt, likesService.unlikeBlog);

export default router;
