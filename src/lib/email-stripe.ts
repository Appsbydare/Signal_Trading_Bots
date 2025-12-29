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
    starter: "Starter Plan ($29/month)",
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
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Payment Successful!</h1>
  </div>
  
  <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      Hi ${params.fullName},
    </p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Thank you for your purchase! Your payment has been processed successfully and your trading bot license is ready to use.
    </p>
    
    <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Your License Key:</p>
      <p style="font-size: 24px; font-weight: bold; color: #667eea; font-family: 'Courier New', monospace; margin: 0; letter-spacing: 2px;">
        ${params.licenseKey}
      </p>
    </div>

    <!-- Magic Link Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="${params.magicLinkUrl}" style="background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);">
        Access Customer Portal
      </a>
      <p style="font-size: 12px; color: #666; margin-top: 10px;">
        (Link expires in 1 hour)
      </p>
    </div>
    
    <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Order ID:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right; font-family: 'Courier New', monospace; font-size: 12px;">${params.orderId}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Plan:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${planName}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Amount Paid:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">$${params.amount} USD</td>
        </tr>
        <tr>
          <td style="padding: 10px 0;"><strong>License Status:</strong></td>
          <td style="padding: 10px 0; text-align: right;">${expiryDate}</td>
        </tr>
      </table>
    </div>
    
    <h2 style="color: #667eea; font-size: 20px; margin-top: 30px;">🚀 Getting Started</h2>
    <ol style="padding-left: 20px;">
      <li style="margin-bottom: 10px;">Download the Trading Bot application from our website</li>
      <li style="margin-bottom: 10px;">Launch the application on your Windows PC or VPS</li>
      <li style="margin-bottom: 10px;">Enter your license key when prompted: <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">${params.licenseKey}</code></li>
      <li style="margin-bottom: 10px;">Configure your MT5 and Telegram settings</li>
      <li style="margin-bottom: 10px;">Start automating your trades!</li>
    </ol>
    
    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #856404;">
        <strong>⚠️ Important:</strong> Keep your license key safe and secure. You can use it on one device at a time. 
        If you need to transfer your license to a different device, please contact support.
      </p>
    </div>
    
    <div style="background-color: #e8f4f8; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #0c4a6e;">
        <strong>💡 Pro Tip:</strong> Start with a demo account to test your signal configurations before going live. 
        This helps you understand SL/TP settings and avoid costly mistakes.
      </p>
    </div>
    
    <h2 style="color: #667eea; font-size: 20px; margin-top: 30px;">📚 Need Help?</h2>
    <p style="margin-bottom: 10px;">Our support team is here to assist you:</p>
    <ul style="padding-left: 20px;">
      <li style="margin-bottom: 8px;">Visit our <a href="https://www.signaltradingbots.com/faq" style="color: #667eea; text-decoration: none;">FAQ page</a></li>
      <li style="margin-bottom: 8px;">Check our <a href="https://www.signaltradingbots.com/resources" style="color: #667eea; text-decoration: none;">documentation</a></li>
      <li style="margin-bottom: 8px;">Watch our <a href="https://www.signaltradingbots.com/resources" style="color: #667eea; text-decoration: none;">video tutorials</a></li>
      <li style="margin-bottom: 8px;">Contact us at <a href="mailto:${FROM_EMAIL}" style="color: #667eea; text-decoration: none;">${FROM_EMAIL}</a></li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://www.signaltradingbots.com/portal" style="background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        Access Customer Portal
      </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #666; text-align: center; margin: 0;">
      Signal Trading Bots | <a href="https://www.signaltradingbots.com" style="color: #667eea; text-decoration: none;">www.signaltradingbots.com</a>
      <br>
      © ${new Date().getFullYear()} All rights reserved.
    </p>
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
      subject: `🎉 Your ${planName} License Key - Signal Trading Bots`,
      html: html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to send Stripe license email", errorText);
    throw new Error(`Failed to send license email: ${errorText}`);
  }
}

