import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

// prisma.$on("beforeExit", async () => {
// 	await prisma.$disconnect();
// });
