import type { Request, Response, NextFunction } from "express";
import { verifyAccessWebToken } from "../utils/jwt.js";

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        });
    }

    const payload = verifyAccessWebToken(token);

    if (
      typeof payload !== "object" ||
      payload === null ||
      !("userId" in payload)
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    req.user = {
      id: Number(payload.userId),
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}