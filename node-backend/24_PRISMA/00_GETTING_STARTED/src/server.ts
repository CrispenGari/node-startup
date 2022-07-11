import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

const main = async () => {
  const users: User[] = await prisma.user.findMany();
  console.log(users);
};

main()
  .then(() => {})
  .catch((error) => console.log(error.message))
  .finally(async () => {
    await prisma.$disconnect();
  });
