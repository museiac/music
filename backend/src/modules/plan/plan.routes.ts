import { Router } from "express";
import { createPlanController, 
    getAllPlanController,
    getActivePlanController, 
    getPlanByIdController, 
    updatePlanController,
    updatePlanStatusController,
    subscribeToPlanController
 } 
 from "./plan.controller.js";

 import { authenticate } from "../../middleware/auth.middleware.js";
 import { requireAdmin } from "../../middleware/admin.middleware.js";

 const router = Router();

 router.post("/admin", authenticate, requireAdmin, createPlanController);
 router.get("/admin", authenticate, requireAdmin, getAllPlanController);
 router.get("/admin/:id", authenticate, requireAdmin, getPlanByIdController);
 router.patch("/admin/:id", authenticate, requireAdmin, updatePlanController);
 router.patch("/admin/:id/status", authenticate, requireAdmin, updatePlanStatusController);

 //routes for user
 router.get("/", getActivePlanController);
 router.post("/subscribe", authenticate, subscribeToPlanController);

 export default router;