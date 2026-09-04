import { Router } from "express";
import { createProfileController } from "./profile.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

router.post("/", authenticate, createProfileController);

export default router;