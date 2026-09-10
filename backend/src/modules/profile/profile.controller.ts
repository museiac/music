import type { Request, Response } from "express";
import { profileSchema } from "./profile.validation.js";
import { createProfile } from "./profile.service.js";
import { success } from "zod";

export async function createProfileController(
    req: Request,
    res: Response,
) {
    try{

        const userId = req.user?.id;

        if(!userId){
            return res.status(401).json({
                success: false,
                message: "Authentication Required"
            });
        }

        const data = profileSchema.parse(req.body);

        const profile = await createProfile(userId, data);

        return res.status(201).json({
            success: true,
            message: "Profile created successfully",
            profile:{
                id: profile.id,
                name: profile.name,
                userId: profile.userId,
            },
        });

    }
    catch(error){
        console.error("Create profile error:", error);

        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                ? error.message
                : "Profile creation failed",
        });
    }
}