import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireAdmin } from "../../middleware/admin.middleware.js";
import { testAdmin } from "./admin.controller.js";

const router = Router();

router.get(
  "/test",
  authenticate,
  requireAdmin,
  testAdmin
);

export default router;