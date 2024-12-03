import express from "express";
import userService from "./user.service";
import { VerifyJwt } from "../../middlewares/jwt-token";
import { userUpdateValidation } from "../../middlewares/handleValidation";

const router = express.Router();

router.get("/", VerifyJwt, userService.getLoggedInUser);
router.put(
  "/update",
  userUpdateValidation,
  VerifyJwt,
  userService.updateUserProfile
);

export default router;
