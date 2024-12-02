import express from "express";
import authService from "../auth/auth.service";
import { userRegistrationValidation } from "../../middlewares/handleValidation";

const router = express.Router();

router.post("/register", userRegistrationValidation, authService.registerUser);
router.post("/login", authService.userLogin);

export default router;
