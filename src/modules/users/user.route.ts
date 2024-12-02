import express from "express";
import userService from "./user.service";
import { VerifyJwt } from "../../middlewares/jwt-token";

const router = express.Router();

router.get("/", VerifyJwt, userService.getLoggedInUser);

export default router;
