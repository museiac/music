import Prisma from "../../config/prisma.js";

export async function adminTest() {
  return {
    message: "Welcome Admin",
  };
}

export async function getAdminUsers() {
  return Prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      verified: true,
      profileCompleted: true,
      createdAt: true,
    },
  });
}