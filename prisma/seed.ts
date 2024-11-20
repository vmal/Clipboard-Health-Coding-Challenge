import { parseArgs } from 'node:util'

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const {
    values: { environment },
  } = parseArgs({ options: {
    environment: { type: 'string' },
  } })

  const envName = environment === 'test' ? 'test' : 'default';
  console.log(`Using '${envName}' environment`);

  // Dynamically import data based on environment
  const { shifts } = await import(`./seed/${envName === 'test' ? 'test-' : ''}shifts`);
  const { workers } = await import('./seed/workers');
  const { workplaces } = await import('./seed/workplaces');

  // Use for loop instead of `await Promise.all` for stable insertion order
  for (const data of workers) {
    await prisma.worker.create({ data });
  }

  for (const data of workplaces) {
    await prisma.workplace.create({ data });
  }

  for (const data of shifts) {
    await prisma.shift.create({ data });
  }

  console.log("Seeding complete.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
