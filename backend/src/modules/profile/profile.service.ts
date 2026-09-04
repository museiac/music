import Prisma from "../../config/prisma.js";
import type { ProfileInput } from "./profile.validation.js";

export async function createProfile(
    userId: number,
    data: ProfileInput
){

    const existingProfile = await Prisma.profile.findUnique({
        where: {
            userId,
        },
    });

    if(existingProfile){
        throw new Error("Profile already exist");
    }

    const profile = await Prisma.$transaction(async (tx) =>{
        const newProfile = await tx.profile.create({
            data: {
                userId,
                name: data.name
            },
        });

        await tx.user.update({
            where: {
                id: userId,
            },

            data: {
                profileCompleted: true,
            },
        });
        return newProfile;
    })
    return profile;
}