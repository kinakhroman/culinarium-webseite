import { config } from "dotenv";
import { resolve } from "path";
import { db } from "./lib/db.js";
import { monitorOrders } from "./tasks/monitor-orders.js";
import { updateDailyMenu } from "./tasks/update-daily-menu.js";
import { generateSocialPost } from "./tasks/generate-social-post.js";

// Load .env from project root
config({ path: resolve(process.cwd(), ".env") });

const tasks: Record<string, () => Promise<void>> = {
  "monitor-orders": monitorOrders,
  "update-daily-menu": updateDailyMenu,
  "generate-social-post": generateSocialPost,
};

async function main() {
  const taskName = process.argv[2] || "all";

  console.log(`\n🤖 Culinarium KI-Agent gestartet — Task: ${taskName}`);
  console.log(`📅 ${new Date().toLocaleString("de-DE")}\n`);

  if (taskName === "all") {
    for (const [name, fn] of Object.entries(tasks)) {
      console.log(`▶ Starte: ${name}`);
      await fn();
      console.log("");
    }
  } else if (tasks[taskName]) {
    await tasks[taskName]();
  } else {
    console.error(`❌ Unbekannter Task: ${taskName}`);
    console.log(`Verfügbare Tasks: ${Object.keys(tasks).join(", ")}, all`);
    process.exit(1);
  }

  console.log("✅ Agent abgeschlossen\n");
  await db.$disconnect();
}

main().catch(async (err) => {
  console.error("Agent-Fehler:", err);
  await db.$disconnect();
  process.exit(1);
});
