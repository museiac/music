import "dotenv/config";

import Prisma from "../src/config/prisma.js";
import { hashPassword } from "../src/utils/password.js";

async function main() {
  const passwordHash = await hashPassword("Admin@123456");

  const admin = await Prisma.user.upsert({
    where: {
      email: "admin@museiac.com",
    },
    update: {
      role: "ADMIN",
      verified: true,
      passwordHash,
    },
    create: {
      name: "Admin",
      email: "admin@museiac.com",
      passwordHash,
      verified: true,
      profileCompleted: true,
      role: "ADMIN",
    },
  });

  console.log("Admin created:", {
    id: admin.id,
    email: admin.email,
    role: admin.role,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await Prisma.$disconnect();
  });