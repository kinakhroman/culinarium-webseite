interface TelegramMessage {
  text: string;
  parse_mode?: "HTML" | "Markdown";
}

export async function sendTelegramMessage(message: TelegramMessage): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn("Telegram nicht konfiguriert: TELEGRAM_BOT_TOKEN oder TELEGRAM_CHAT_ID fehlt");
    return false;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message.text,
          parse_mode: message.parse_mode || "HTML",
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Telegram Fehler:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Telegram Sendefehler:", error);
    return false;
  }
}

export function formatOrderTelegramMessage(order: {
  orderNumber: string;
  customerName: string;
  customerPhone?: string | null;
  orderType: string;
  requestedTime?: Date | null;
  total: number;
  notes?: string | null;
  items: { itemName: string; quantity: number; unitPrice: number }[];
}): string {
  const typeLabel = order.orderType === "PICKUP" ? "Abholung" : "Lieferung";
  const time = order.requestedTime
    ? new Date(order.requestedTime).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
    : "Schnellstmöglich";

  const itemLines = order.items
    .map((item) => `  • ${item.quantity}x ${item.itemName} (${item.unitPrice.toFixed(2)} €)`)
    .join("\n");

  let msg = `🔔 <b>Neue Bestellung!</b>\n\n`;
  msg += `📋 <b>${order.orderNumber}</b>\n`;
  msg += `👤 ${order.customerName}`;
  if (order.customerPhone) msg += ` | 📞 ${order.customerPhone}`;
  msg += `\n📦 ${typeLabel} | ⏰ ${time}\n\n`;
  msg += `<b>Artikel:</b>\n${itemLines}\n\n`;
  msg += `💰 <b>Gesamt: ${order.total.toFixed(2)} €</b>`;
  if (order.notes) msg += `\n\n📝 <i>${order.notes}</i>`;

  return msg;
}
