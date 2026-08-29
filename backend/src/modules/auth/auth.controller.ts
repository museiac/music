import type { Request, Response } from "express"
import { registerSchema, loginSchema } from "./auth.validation.js"
import { registerUser, loginUser } from "./auth.service.js"


export async function register(req: Request, res: Response){
    try{

        const data = registerSchema.parse(req.body);

        const user = await registerUser(data);

        return res.status(201).json({
            success: true,
            message: "Regestered succesfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                verified: user.verified,
                profileCompleted: user.profileCompleted
            },
        });
    }
    catch(error){
        console.log("regester error: ", error);

        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Registration failed",
        })
    }
}

export async function login(req: Request, res: Response) {
  try {
    // 1. Validate login body
    const data = loginSchema.parse(req.body);

    // 2. Login service
    const result = await loginUser(data);

    // 3. Email verification required
    if (result.requiresVerification) {
      return res.status(200).json({
        success: true,
        requiresVerification: true,
        message: "Please verify your email first",
        userId: result.userId,
        email: result.email,
      });
    }

    // 4. Successful login
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: result.existUser.id,
        name: result.existUser.name,
        email: result.existUser.email,
        verified: result.existUser.verified,
        profileCompleted: result.existUser.profileCompleted,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Login failed",
    });
  }
}