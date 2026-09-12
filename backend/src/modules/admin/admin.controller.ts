import type { Request, Response } from "express";
import { adminTest, getAdminUsers, getAdminLeads, getAdminLeadById, updateAdminLead, getAdminLeadStats } from "./admin.service.js";
import { updateLeadSchema } from "./admin.validation.js";
import { adminLeadsQuerySchema } from "./admin.validation.js";

export async function testAdmin(req: Request, res: Response) {
  try {
    const result = await adminTest();

    return res.status(200).json({
      success: true,
      ...result,
      userId: req.user?.id,
    });
  } catch (error) {
    console.error("Admin test error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
}

export async function listUsers(req: Request, res: Response) {
  try {
    const users = await getAdminUsers();
    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Admin users error:", error);
    return res.status(500).json({ success: false, message: "Could not fetch users" });
  }
}

export async function listLeads(req: Request, res: Response) {
    try {
        const query = adminLeadsQuerySchema.parse(req.query);

        const result = await getAdminLeads(query);

        return res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        console.error("Admin leads error:", error);

        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Could not fetch leads",
        });
    }
}

export async function getLeadById(req: Request, res: Response) {
    try {
        const leadId = Number(req.params.id);

        if (Number.isNaN(leadId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid lead id",
            });
        }

        const lead = await getAdminLeadById(leadId);

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: "Lead not found",
            });
        }

        return res.status(200).json({
            success: true,
            lead,
        });
    } catch (error) {
        console.error("Admin lead detail error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not fetch lead",
        });
    }
}

export async function updateLead(req: Request, res: Response) {
    try {
        const leadId = Number(req.params.id);

        if (Number.isNaN(leadId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid lead id",
            });
        }

        const data = updateLeadSchema.parse(req.body);

        const lead = await updateAdminLead(leadId, data);

        return res.status(200).json({
            success: true,
            message: "Lead updated successfully",
            lead,
        });
    } catch (error) {
        console.error("Admin update lead error:", error);

        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Could not update lead",
        });
    }
}

export async function leadStats(req: Request, res: Response) {
    try {
        const stats = await getAdminLeadStats();

        return res.status(200).json({
            success: true,
            stats,
        });
    } catch (error) {
        console.error("Admin lead stats error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not fetch lead stats",
        });
    }
}