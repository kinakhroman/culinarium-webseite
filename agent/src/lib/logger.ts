import { db } from "./db.js";

export async function logAgentTask(
  taskName: string,
  status: "SUCCESS" | "FAILURE" | "SKIPPED",
  message?: string,
  details?: Record<string, unknown>
) {
  await db.agentLog.create({
    data: {
      taskName,
      status,
      message: message || null,
      details: details ? JSON.stringify(details) : null,
    },
  });

  const timestamp = new Date().toISOString();
  const emoji = status === "SUCCESS" ? "✅" : status === "FAILURE" ? "❌" : "⏭️";
  console.log(`[${timestamp}] ${emoji} ${taskName}: ${message || status}`);
}
