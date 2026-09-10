import type { Request , Response } from "express";
import { createPlanSchema, updatePlanSchema } from "./plan.validate.js";
import { createPlan, getAllPlans, getActivePlans, getPlanById, subscribeToPlan, updatePlan, updatePlanStatus } from "./plan.service.js";


export async function createPlanController(
    req: Request,
    res: Response
){
    try{
        const data = createPlanSchema.parse(req.body);

        const plan = await createPlan(data);

        return res.status(201).json({
            success: true,
            message: "Plan create successfully",
            plan,
        });
    }
    catch(error){
        console.error("Create paln error :" , error);

        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                ?error.message
                : "Plan creation failed",
        });
    }
}

export async function getAllPlanController(
    req: Request,
    res: Response
) {
    try{
        const plans = await getAllPlans();

        return res.status(200).json({
            success: true,
            plans,
        });
    }
    catch(error){
         console.error("Get all plans error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch plans",
        });
    }
}


export async function getActivePlanController(
    req: Request,
    res: Response
){
    try{
        const plans = await  getActivePlans();

        return res.status(200).json({
            success: true,
            plans,
        });
    }
    catch(error){
        console.error("Get active plans error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch plans",
        });
    }
}


export async function getPlanByIdController(
    req: Request,
    res: Response,
){
    try{
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid plan ID",
            });
        }

        const plan = await getPlanById(id);

        return res.status(200).json({
            success: true,
            plan,
        });

    }
    catch(error){
        console.error("Get plan error:", error);

        return res.status(404).json({
            success: false,
            message:
                error instanceof Error
                ? error.message
                : "Plan not found",
        });
    }
}


export async function updatePlanController(
    req: Request,
    res: Response
){
    try{
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid plan ID",
            });
        }

        const data = updatePlanSchema.parse(req.body);

        const plan = await updatePlan(id, data);

        return res.status(200).json({
            success: true,
            message: "Plan Updated",
            plan,
        }) 

    }
    catch(error){
        console.error("Update plan error:", error);

        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                ? error.message
                : "Plan update failed",
        });
    }
}



export async function updatePlanStatusController(
    req: Request,
    res: Response
){
    try{
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid plan ID",
            });
        }

        const { status } = req.body;

        if(
            status !== "ACTIVE" &&
            status !== "INACTIVE" &&
            status !== "ARCHIVED"
        ){
            return res.status(400).json({
                success: false,
                message: "Invalid plan status",
            });
        }

        const plan = await updatePlanStatus(id, status);

        return res.status(200).json({
            success: true,
            message: "Plan status updated successfully",
            plan,
        });

    }
    catch(error){
        console.error("Update plan status error:", error);

        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                ? error.message
                : "Plan status update failed",
        });
    }
}

export async function subscribeToPlanController(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const planId = Number(req.body.planId);

        if (!userId) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }
        if (!Number.isInteger(planId) || planId <= 0) {
            return res.status(400).json({ success: false, message: "A valid plan ID is required" });
        }

        const subscription = await subscribeToPlan(userId, planId);
        return res.status(201).json({
            success: true,
            message: "Plan selected successfully",
            subscription,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Could not select plan",
        });
    }
}