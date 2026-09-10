import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireAdmin } from "../../middleware/admin.middleware.js";
import { listUsers, testAdmin } from "./admin.controller.js";

const router = Router();

router.get(
  "/test",
  authenticate,
  requireAdmin,
  testAdmin
);
router.get("/users", authenticate, requireAdmin, listUsers);

export default router;