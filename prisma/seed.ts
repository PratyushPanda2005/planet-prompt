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

const MODELS_SEED = [
  { name: "claude-3-5-sonnet", displayName: "Claude 3.5 Sonnet", carbonPer1k: 0.3, waterPer1k: 3.0, landPer1k: 0.5 },
  { name: "gpt-4o", displayName: "GPT-4o", carbonPer1k: 0.3, waterPer1k: 3.0, landPer1k: 0.5 },
  { name: "llama-3-70b", displayName: "Llama 3 70b", carbonPer1k: 0.2, waterPer1k: 2.0, landPer1k: 0.3 }
];

async function main() {
  console.log("Seeding database...");

  // 1. Clear existing model configs and seed them
  await prisma.modelConfig.deleteMany();
  console.log("Cleared existing model configurations.");

  const seededModels = [];
  for (const m of MODELS_SEED) {
    const dbModel = await prisma.modelConfig.create({
      data: m
    });
    seededModels.push(dbModel);
    console.log(`Seeded model config: ${dbModel.displayName}`);
  }

  // 2. Create default user
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

  // Clear existing query logs and reports to start fresh
  await prisma.queryLog.deleteMany({
    where: { userId: user.id }
  });
  await prisma.report.deleteMany({
    where: { userId: user.id }
  });

  // 3. Generate 30 days of history
  const logs = [];
  const now = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const logDate = new Date(now);
    logDate.setDate(now.getDate() - i);
    // Random number of queries per day (between 2 and 6)
    const numQueries = Math.floor(Math.random() * 5) + 2;

    for (let j = 0; j < numQueries; j++) {
      const promptText = PROMPTS_POOL[Math.floor(Math.random() * PROMPTS_POOL.length)];
      const modelInfo = seededModels[Math.floor(Math.random() * seededModels.length)];
      
      // Random tokens between 150 and 1200
      const tokenCount = Math.floor(Math.random() * 1050) + 150;
      
      // Conversion: dynamic ratios based on database-seeded metrics
      const carbonGrams = Number(((tokenCount / 1000) * modelInfo.carbonPer1k).toFixed(4));
      const waterMl = Number(((tokenCount / 1000) * modelInfo.waterPer1k).toFixed(4));
      const landCm2 = Number(((tokenCount / 1000) * modelInfo.landPer1k).toFixed(4));

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
