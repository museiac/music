import type { Request, Response } from "express";
import { adminTest, getAdminUsers } from "./admin.service.js";

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