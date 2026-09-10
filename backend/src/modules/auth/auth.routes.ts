import { Router } from "express";

import { register, login, verifyEmail, me, resendOtp } from "./auth.controller.js"
import { authenticate } from "../../middleware/auth.middleware.js";

const router  = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOtp);
router.get("/me", authenticate, me);

export default router;