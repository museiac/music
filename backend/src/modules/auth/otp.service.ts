import Prisma from "../../config/prisma.js";
import { hashPassword, comparePassword } from "../../utils/password.js";
import { generateOtp } from "../../utils/otp.js";
import { sendVerificationOtp } from "../../services/email/email.service.js";

export async function createEmailOtp(userId: number){

    const otp = generateOtp();

    const otpHash = await hashPassword(otp);

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await Prisma.emailVerification.deleteMany({
        where: {
            userId,
        },
    });

    await Prisma.emailVerification.create({
        data: {
            userId,
            otpHash,
            expiresAt,
        },
    });

  return otp;
}

export async function createAndSendEmailOtp(
  userId: number,
  email: string
) {
  const otp = await createEmailOtp(userId);

  await sendVerificationOtp(email, otp);
}

export async function verifyEmailOtp(userId: number, otp: string) {
  
  const verification = await Prisma.emailVerification.findFirst({
    where:{
      userId,
      expiresAt:{
        gt: new Date(),
      },
    },
    orderBy:{
      createdAt: "desc",
    },
  });

  if(!verification){
    throw new Error("OTP expires not found")
  }

  const isValid = comparePassword(
    otp,
    verification.otpHash
  );

  if(!isValid){
    throw new Error("Invalid OTP");
  }

  await Prisma.user.update({
    where:{
      id: userId,
    },
    data: {
      verified: true,
    },
  });

  await Prisma.emailVerification.delete({
    where: {
      id: verification.id,
    },
  });

  return true;
}