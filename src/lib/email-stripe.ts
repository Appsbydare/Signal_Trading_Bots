import "server-only";

const FROM_EMAIL = process.env.SUPPORT_FROM_EMAIL;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

/**
 * Send license key email for Stripe orders
 */
export async function sendStripeLicenseEmail(params: {

  to: string;
  fullName: string;
  licenseKey: string;
  plan: string;
  orderId: string;
  amount: number;
  magicLinkUrl: string;
}): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn(
      "RESEND_API_KEY is not configured. License email will not be sent.",
    );
    return;
  }

  if (!FROM_EMAIL) {
    console.warn(
      "SUPPORT_FROM_EMAIL is not configured. License email will not be sent.",
    );
    return;
  }

  const planNames: Record<string, string> = {
    starter: "Starter Plan ($0.99/month)",
    pro: "Pro Plan ($49/month)",
    lifetime: "Lifetime License ($999)",
  };

  const planName = planNames[params.plan.toLowerCase()] || params.plan;
  const expiryDate = params.plan.toLowerCase() === 'lifetime'
    ? 'Never (Lifetime Access)'
    : 'Renews monthly';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Trading Bot License</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f9fafb;">
  <div style="background: #ffffff; margin: 40px 20px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: #1f2937; padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 600; letter-spacing: -0.5px;">Payment Successful</h1>
    </div>
  
    <div style="padding: 40px 30px;">
      <p style="font-size: 16px; margin-bottom: 8px; color: #374151;">
        Hi ${params.fullName},
      </p>
      
      <p style="font-size: 16px; margin-bottom: 28px; color: #374151;">
        Thank you for your purchase! Your payment has been processed successfully and your trading bot license is ready to use.
      </p>
      
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 24px 0; border-left: 3px solid #1f2937;">
        <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">License Key</p>
        <p style="font-size: 20px; font-weight: 700; color: #1f2937; font-family: 'Courier New', monospace; margin: 0; letter-spacing: 2px; word-break: break-all;">
          ${params.licenseKey}
        </p>
      </div>

      <!-- Magic Link Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${params.magicLinkUrl}" style="background-color: #1f2937; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 15px;">
          Access Customer Portal
        </a>
        <p style="font-size: 12px; color: #6b7280; margin-top: 12px;">
          Link expires in 1 hour
        </p>
      </div>
      
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 24px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">Order ID</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-family: 'Courier New', monospace; font-size: 13px; color: #1f2937;">${params.orderId}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">Plan</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #1f2937; font-weight: 600;">${planName}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">Amount Paid</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #1f2937; font-weight: 600;">$${params.amount} USD</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">License Status</td>
            <td style="padding: 10px 0; text-align: right; color: #1f2937; font-weight: 600;">${expiryDate}</td>
          </tr>
        </table>
      </div>
      
      <h2 style="color: #1f2937; font-size: 18px; margin-top: 32px; margin-bottom: 16px; font-weight: 600;">Getting Started</h2>
      <ol style="padding-left: 20px; color: #374151;">
        <li style="margin-bottom: 10px; font-size: 14px;">Download the Trading Bot application from our website</li>
        <li style="margin-bottom: 10px; font-size: 14px;">Launch the application on your Windows PC or VPS</li>
        <li style="margin-bottom: 10px; font-size: 14px;">Enter your license key when prompted</li>
        <li style="margin-bottom: 10px; font-size: 14px;">Configure your MT5 and Telegram settings</li>
        <li style="margin-bottom: 10px; font-size: 14px;">Start automating your trades</li>
      </ol>
      
      <div style="background-color: #fef3c7; border-left: 3px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
        <p style="margin: 0; color: #92400e; font-size: 14px;">
          <strong>Important:</strong> Keep your license key safe and secure. You can use it on one device at a time. 
          If you need to transfer your license to a different device, please contact support.
        </p>
      </div>
    
      <div style="background-color: #dbeafe; border-left: 3px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 4px;">
        <p style="margin: 0; color: #1e40af; font-size: 14px;">
          <strong>Pro Tip:</strong> Start with a demo account to test your signal configurations before going live. 
          This helps you understand SL/TP settings and avoid costly mistakes.
        </p>
      </div>
      
      <h2 style="color: #1f2937; font-size: 18px; margin-top: 32px; margin-bottom: 16px; font-weight: 600;">Need Help?</h2>
      <p style="margin-bottom: 12px; color: #374151; font-size: 14px;">Our support team is here to assist you:</p>
      <ul style="padding-left: 20px; color: #374151;">
        <li style="margin-bottom: 8px; font-size: 14px;">Visit our <a href="https://www.signaltradingbots.com/faq" style="color: #1f2937; text-decoration: none; font-weight: 600;">FAQ page</a></li>
        <li style="margin-bottom: 8px; font-size: 14px;">Check our <a href="https://www.signaltradingbots.com/resources" style="color: #1f2937; text-decoration: none; font-weight: 600;">documentation</a></li>
        <li style="margin-bottom: 8px; font-size: 14px;">Watch our <a href="https://www.signaltradingbots.com/resources" style="color: #1f2937; text-decoration: none; font-weight: 600;">video tutorials</a></li>
        <li style="margin-bottom: 8px; font-size: 14px;">Contact us at <a href="mailto:${FROM_EMAIL}" style="color: #1f2937; text-decoration: none; font-weight: 600;">${FROM_EMAIL}</a></li>
      </ul>
    </div>
    
    <div style="background: #f9fafb; padding: 24px 30px; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 12px; color: #6b7280; text-align: center; margin: 0;">
        SignalTradingBots | <a href="https://www.signaltradingbots.com" style="color: #1f2937; text-decoration: none;">www.signaltradingbots.com</a>
        <br>
        © ${new Date().getFullYear()} All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  // Debug logging
  console.log("🔍 Email Debug Info:");
  console.log("FROM_EMAIL:", FROM_EMAIL);
  console.log("SUPPORT_FROM_EMAIL env:", process.env.SUPPORT_FROM_EMAIL);
  console.log("RESEND_API_KEY exists:", !!RESEND_API_KEY);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: params.to,
      subject: `Your ${planName} License Key - Signal Trading Bots`,
      html: html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to send Stripe license email", errorText);
    throw new Error(`Failed to send license email: ${errorText}`);
  }
}

