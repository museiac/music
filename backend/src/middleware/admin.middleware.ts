import type{ Request, Response, NextFunction } from "express";
import Prisma from "../config/prisma.js";
import { success } from "zod";

export async function requireAdmin(
    req: Request,
    res: Response,
    next: NextFunction,
){
    try{
        if(!req.user){
            return res.status(401).json({
                success: false,
                message: "Authentication Required",
            });
        }

        const user = await Prisma.user.findUnique({
            where:{
                id: req.user.id,
            },
            select:{
                role: true,
            },
        });

        if(!user){
            return res.status(401).json({
                success: false,
                message: "User not found"
            })
        }

        if(user.role !== "ADMIN"){
            return res.status(401).json({
                success: false,
                message:"Admin access required",
            });
        }

        next();
    }
    catch(error){
        console.error("Admin middleware error:", error);

        return res.status(500).json({
            success: false,
            message: "Authorization failed",
        });
    }
}