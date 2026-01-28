import "server-only";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_ADMIN_CHANNEL_ID = process.env.TELEGRAM_ADMIN_CHANNEL_ID;

interface NotificationParams {
    fullName: string;
    email: string;
    plan: string;
    amount: number;
    orderId: string;
    country?: string;
    stripeLink?: string;
    // Intentionally omitting licenseKey as requested
}

/**
 * Sends a notification message to the configured Telegram Admin Channel
 */
export async function sendTelegramAdminNotification(params: NotificationParams): Promise<void> {
    if (!TELEGRAM_BOT_TOKEN) {
        console.warn("TELEGRAM_BOT_TOKEN is not configured. Telegram notification will not be sent.");
        return;
    }

    if (!TELEGRAM_ADMIN_CHANNEL_ID) {
        console.warn("TELEGRAM_ADMIN_CHANNEL_ID is not configured. Telegram notification will not be sent.");
        return;
    }

    console.log(`Sending Telegram notification to ${TELEGRAM_ADMIN_CHANNEL_ID} using bot ending in ...${TELEGRAM_BOT_TOKEN.slice(-5)}`);

    // Format the message
    // Using Markdown or HTML parsing mode for bolding
    let messageText = `
🔔 *New Purchase Received*

👤 *Customer:* ${params.fullName}
📧 *Email:* ${escapeMarkdown(params.email)}
📦 *Plan:* ${params.plan}
💰 *Amount:* $${params.amount}
🆔 *Order ID:* \`${params.orderId}\`
  `.trim();

    if (params.country) {
        messageText += `\n🌍 *Country:* ${params.country}`;
    }

    if (params.stripeLink) {
        messageText += `\n🔗 *Stripe Order:* [View in Dashboard](${params.stripeLink})`;
    }

    messageText += `\n\n_This is an automated notification._`;

    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_ADMIN_CHANNEL_ID,
                text: messageText,
                parse_mode: "Markdown",
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Failed to send Telegram notification:", errorData);
        } else {
            console.log("Telegram notification sent successfully.");
        }

    } catch (error) {
        console.error("Error sending Telegram notification:", error);
    }
}

/**
 * Helper to escape Markdown special characters to prevent broken formatting
 * For standard Markdown, we escape: _ * [ ] ( ) ~ ` > # + - = | { } . !
 * However, Telegram's "Markdown" (v1) is simpler *bold*, _italic_, `code`, [link](url)
 * It's safer to use "Markdown" mode and just be careful, or use "HTML".
 * Let's stick to basic escaping for user inputs like names/emails.
 */
function escapeMarkdown(text: string): string {
    // Simplistic escape for Telegram "Markdown" mode (legacy)
    // It mainly cares about underscores and asterisks.
    return text.replace(/[_*`[\]]/g, '\\$&');
}
