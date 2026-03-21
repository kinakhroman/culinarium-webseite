import { db } from "../lib/db.js";
import { logAgentTask } from "../lib/logger.js";
import { sendTelegram } from "../services/telegram-service.js";

export async function monitorOrders() {
  try {
    const unnotified = await db.order.findMany({
      where: { telegramNotified: false },
      include: { orderItems: true },
      orderBy: { createdAt: "asc" },
    });

    if (unnotified.length === 0) {
      await logAgentTask("monitor-orders", "SKIPPED", "Keine neuen Bestellungen");
      return;
    }

    let sentCount = 0;
    for (const order of unnotified) {
      const typeLabel = order.orderType === "PICKUP" ? "Abholung" : "Lieferung";
      const time = order.requestedTime
        ? new Date(order.requestedTime).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
        : "Schnellstmöglich";

      const items = order.orderItems
        .map((i) => `  • ${i.quantity}x ${i.itemName} (${i.unitPrice.toFixed(2)} €)`)
        .join("\n");

      let msg = `🔔 <b>Neue Bestellung!</b>\n\n`;
      msg += `📋 <b>${order.orderNumber}</b>\n`;
      msg += `👤 ${order.customerName}`;
      if (order.customerPhone) msg += ` | 📞 ${order.customerPhone}`;
      msg += `\n📦 ${typeLabel} | ⏰ ${time}\n\n`;
      msg += `<b>Artikel:</b>\n${items}\n\n`;
      msg += `💰 <b>Gesamt: ${order.total.toFixed(2)} €</b>`;
      if (order.notes) msg += `\n\n📝 <i>${order.notes}</i>`;

      const sent = await sendTelegram(msg);
      if (sent) {
        await db.order.update({
          where: { id: order.id },
          data: { telegramNotified: true },
        });
        sentCount++;
      }
    }

    await logAgentTask(
      "monitor-orders",
      "SUCCESS",
      `${sentCount} von ${unnotified.length} Bestellungen per Telegram gesendet`
    );
  } catch (error) {
    await logAgentTask("monitor-orders", "FAILURE", String(error));
  }
}
