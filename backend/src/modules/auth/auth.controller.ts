import type { Request, Response } from "express"
import { registerSchema, loginSchema } from "./auth.validation.js"
import { getUserById, registerUser, loginUser } from "./auth.service.js"
import { createAndSendEmailOtp, verifyEmailOtp } from "./otp.service.js";

function publicUser(user: {
  id: number;
  name: string;
  email: string;
  verified: boolean;
  profileCompleted: boolean;
  role: "USER" | "ADMIN";
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    verified: user.verified,
    profileCompleted: user.profileCompleted,
    role: user.role,
  };
}


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
    //console.log("Controller token:", result.accessToken);

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
      accessToken: result.accessToken,
      user: publicUser(result.existUser),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Login failed",
    });
  }
}

export async function verifyEmail(req: Request, res: Response) {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: "User ID and OTP are required",
      });
    }

    const result = await verifyEmailOtp(
      Number(userId),
      String(otp)
    );

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      accessToken: result.accessToken,
      user: publicUser(result.user),
    });

  } catch (error) {
    console.error("Verify email error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Email verification failed",
    });
  }
}

export async function me(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const user = await getUserById(userId);
    return res.status(200).json({ success: true, user: publicUser(user) });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error instanceof Error ? error.message : "User not found",
    });
  }
}

export async function resendOtp(req: Request, res: Response) {
  try {
    const userId = Number(req.body.userId);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ success: false, message: "A valid user ID is required" });
    }

    const user = await getUserById(userId);
    if (user.verified) {
      return res.status(400).json({ success: false, message: "Email is already verified" });
    }

    await createAndSendEmailOtp(user.id, user.email);
    return res.status(200).json({ success: true, message: "A new verification code has been sent" });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Could not resend verification code",
    });
  }
}