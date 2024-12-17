import express from "express";
import userService from "./user.service";
import { VerifyJwt } from "../../middlewares/jwt-token";
import {
  singleUserDetailsValidation,
  userUpdateValidation,
} from "../../middlewares/handleValidation";

const router = express.Router();

router.get("/", VerifyJwt, userService.getLoggedInUser);
router.put(
  "/update",
  userUpdateValidation,
  VerifyJwt,
  userService.updateUserProfile
);
router.get(
  "/profile/:id",
  singleUserDetailsValidation,
  VerifyJwt,
  userService.getSingleUserDetails
);

export default router;
