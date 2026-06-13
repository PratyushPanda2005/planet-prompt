import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PROMPTS_POOL = [
  "Explain quantum computing in simple terms",
  "Write a python script to parse CSV files and compute average salaries",
  "Help me draft a professional email to my manager asking for PTO next Friday",
  "Optimize this SQL query for performance: SELECT * FROM users JOIN orders ON users.id = orders.user_id WHERE orders.amount > 100",
  "What are the main differences between REST and GraphQL? List pros and cons.",
  "Write a React hook to manage local storage state with synchronization across tabs",
  "Can you write a poem about code compiling on the first try?",
  "Translate this English text to French: 'Thank you for your cooperation, we will review the changes shortly.'",
  "Explain how Docker containers work under the hood (namespaces, cgroups)",
  "Suggest a 7-day itinerary for a trip to Kyoto, Japan, focusing on food and culture",
];

const MODELS = [
  { name: "claude-3-5-sonnet", conversion: { carbon: 0.3, water: 3.0, land: 0.5 } },
  { name: "gpt-4o", conversion: { carbon: 0.3, water: 3.0, land: 0.5 } },
  { name: "gpt-3-5-turbo", conversion: { carbon: 0.1, water: 1.0, land: 0.15 } },
  { name: "llama-3-70b", conversion: { carbon: 0.2, water: 2.0, land: 0.3 } }
];

async function main() {
  console.log("Seeding database...");

  // 1. Create default user
  const user = await prisma.user.upsert({
    where: { email: "developer@planetprompt.io" },
    update: {},
    create: {
      id: "default-user",
      email: "developer@planetprompt.io",
      name: "Green Dev",
    },
  });

  console.log(`User created/found: ${user.name} (${user.email})`);

  // Clear existing query logs to start fresh
  await prisma.queryLog.deleteMany({
    where: { userId: user.id }
  });
  await prisma.report.deleteMany({
    where: { userId: user.id }
  });

  // 2. Generate 30 days of history
  const logs = [];
  const now = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const logDate = new Date(now);
    logDate.setDate(now.getDate() - i);
    // Random number of queries per day (between 2 and 6)
    const numQueries = Math.floor(Math.random() * 5) + 2;

    for (let j = 0; j < numQueries; j++) {
      const promptText = PROMPTS_POOL[Math.floor(Math.random() * PROMPTS_POOL.length)];
      const modelInfo = MODELS[Math.floor(Math.random() * MODELS.length)];
      
      // Random tokens between 150 and 1200
      const tokenCount = Math.floor(Math.random() * 1050) + 150;
      
      // Conversion: 1000 tokens = 0.3g CO2, 3ml water, 0.5cm2 land (based on the model's multiplier)
      const carbonGrams = Number(((tokenCount / 1000) * modelInfo.conversion.carbon).toFixed(4));
      const waterMl = Number(((tokenCount / 1000) * modelInfo.conversion.water).toFixed(4));
      const landCm2 = Number(((tokenCount / 1000) * modelInfo.conversion.land).toFixed(4));

      // Scatter the hours throughout the day
      const queryTime = new Date(logDate);
      queryTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

      logs.push({
        userId: user.id,
        promptText,
        modelUsed: modelInfo.name,
        tokenCount,
        carbonGrams,
        waterMl,
        landCm2,
        createdAt: queryTime,
      });
    }
  }

  // Use createMany
  await prisma.queryLog.createMany({
    data: logs
  });

  console.log(`Successfully seeded ${logs.length} query logs over the last 30 days.`);
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
