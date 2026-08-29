import Prisma from "../../config/prisma.js";
import { hashPassword, comparePassword } from "../../utils/password.js";
import type { RegisterInput, LoginInput } from "./auth.validation.js";

export async function  registerUser(data: RegisterInput) {
    
    const existUser = await Prisma.user.findUnique({
        where:{
            email: data.email,
        },
    });

    if(existUser){
        throw new Error("User allredy exist with this email")
    }

    const passwordHash = await hashPassword(data.password);
    const user = await Prisma.user.create({
        data:{
            name: data.name,
            email: data.email,
            passwordHash,
            accounts: {
                create: {
                    provider: "credentials",
                    providerAccountId: data.email,
                },
            },
        },
    });

    return user;
}

export async function loginUser(data: LoginInput){

    const existUser =await Prisma.user.findUnique({
        where:{
            email: data.email,
        },
    })

    if(!existUser){
        throw new Error("Invalid Email and Password");
    }

    if(!existUser.passwordHash){
        throw new Error("Please use your Google account to login");
    }

    const isPasswordValid = await comparePassword(
        data.password,
        existUser.passwordHash
    );

    if(!isPasswordValid){
        throw new Error("Invalid Email and Password")
    };

    if(!existUser.verified){
        return {
            requiresVerification: true as const,
            userId: existUser.id,
            email: existUser.email,
        }
    }

    return {
        requiresVerification: false as const,
        existUser,
    };
}

