import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireAdmin } from "../../middleware/admin.middleware.js";
import { listUsers, testAdmin, listLeads, getLeadById, updateLead, leadStats } from "./admin.controller.js";

const router = Router();

router.get(
  "/test",
  authenticate,
  requireAdmin,
  testAdmin
);
router.get("/users", authenticate, requireAdmin, listUsers);

router.get("/leads", authenticate, requireAdmin, listLeads);

router.get("/leads/stats", authenticate, requireAdmin, leadStats);

router.patch("/leads/:id", authenticate, requireAdmin, updateLead);

router.get("/leads/:id", authenticate, requireAdmin, getLeadById);

export default router;