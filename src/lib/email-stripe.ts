import "server-only";
import { PLAN_SALE_USD } from "@/lib/plan-pricing";

const FROM_EMAIL = process.env.SUPPORT_FROM_EMAIL;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

/**
 * Send admin notification email for new purchases/subscriptions
 */
export async function sendAdminNotificationEmail(params: {
  customerEmail: string;
  fullName: string;
  licenseKey: string;
  plan: string;
  amount: number;
  orderId: string;
}): Promise<void> {
  // Hardcoded as requested
  const ADMIN_EMAIL = "support@signaltradingbots.com";

  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not configured. Admin email will not be sent.");
    return;
  }

  if (!FROM_EMAIL) {
    console.warn("SUPPORT_FROM_EMAIL is not configured. Admin email will not be sent.");
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Purchase Notification</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">New Purchase Received</h2>
        <p style="font-size: 16px;">A new purchase/subscription has been made on Signal Trading Bots.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #4b5563;">Customer Details</h3>
          <ul style="list-style-type: none; padding: 0;">
            <li style="margin-bottom: 8px;"><strong>Name:</strong> ${params.fullName}</li>
            <li style="margin-bottom: 8px;"><strong>Email:</strong> <a href="mailto:${params.customerEmail}">${params.customerEmail}</a></li>
          </ul>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #4b5563;">Order Selection</h3>
          <ul style="list-style-type: none; padding: 0;">
            <li style="margin-bottom: 8px;"><strong>Plan:</strong> ${params.plan}</li>
            <li style="margin-bottom: 8px;"><strong>Amount:</strong> $${params.amount}</li>
            <li style="margin-bottom: 8px;"><strong>Order ID:</strong> ${params.orderId}</li>
          </ul>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          This is an automated notification.
        </p>
      </div>
    </body>
    </html>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL, // Send from the system email
        to: ADMIN_EMAIL,
        reply_to: params.customerEmail, // Allow replying to the customer
        subject: `New Subscriber: ${params.fullName} (${params.plan})`,
        html: html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to send admin notification email:", errorText);
    } else {
      console.log("Admin notification email sent to", ADMIN_EMAIL);
    }
  } catch (error) {
    console.error("Error sending admin notification email:", error);
  }
}

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
  downloadUrl?: string; // Optional download URL for installer
}): Promise<void> {
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured; license email was not sent.");
  }

  if (!FROM_EMAIL) {
    throw new Error("SUPPORT_FROM_EMAIL is not configured; license email was not sent.");
  }

  const planNames: Record<string, string> = {
    starter_yearly: `Starter Plan ($${PLAN_SALE_USD.starter_yearly}/year)`,
    pro_yearly: `Pro Plan ($${PLAN_SALE_USD.pro_yearly}/year)`,
    lifetime: `Lifetime License ($${PLAN_SALE_USD.lifetime})`,
    orb_lifetime: `ORB Bot Lifetime ($${PLAN_SALE_USD.orb_lifetime} one-time)`,
  };

  const planKey = params.plan.toLowerCase();
  const planName = planNames[planKey] || params.plan;
  const isLifetimePlan = planKey === "lifetime" || planKey === "orb_lifetime";
  const isOrb = planKey === "orb_lifetime";

  const expiryDate = isLifetimePlan ? 'Never (Lifetime Access)' : 'Renews annually';

  const headline = isOrb ? "ORB Bot — payment successful" : "Payment Successful";
  const bodyText = isOrb
    ? "Thank you for your purchase! Your payment was successful. Your <strong>ORB Bot</strong> lifetime license key is below (it starts with <strong>ORB</strong>). Use the download button when shown to get the Windows installer."
    : "Thank you for your purchase! Your payment has been processed successfully and your trading bot license is ready to use.";

  const downloadBlurb = isOrb
    ? "Download the <strong>ORB Bot</strong> Windows setup (.exe):"
    : "Click the button below to download the TelegramSignalBot Installer:";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isOrb ? "Your ORB Bot License" : "Your Trading Bot License"}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f9fafb;">
  <div style="background: #ffffff; margin: 40px 20px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: #1f2937; padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 600; letter-spacing: -0.5px;">${headline}</h1>
    </div>
  
    <div style="padding: 40px 30px;">
      <p style="font-size: 16px; margin-bottom: 8px; color: #374151;">
        Hi ${params.fullName},
      </p>
      
      <p style="font-size: 16px; margin-bottom: 28px; color: #374151;">
        ${bodyText}
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

      ${params.downloadUrl ? `
      <!-- Download Button -->
      <div style="background-color: #dbeafe; border-left: 3px solid #3b82f6; padding: 20px; margin: 24px 0; border-radius: 6px;">
        <h3 style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px; font-weight: 600;">📥 Download Your Software</h3>
        <p style="margin: 0 0 16px 0; color: #1e40af; font-size: 14px;">
          ${downloadBlurb}
        </p>
        <div style="text-align: center;">
          <a href="${params.downloadUrl}" style="background-color: #3b82f6; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 15px;">
            Download Installer
          </a>
        </div>
        <p style="font-size: 12px; color: #1e40af; margin-top: 12px; text-align: center;">
          ⏱️ Download link expires in 1 hour • Single-use only
        </p>
        <p style="font-size: 12px; color: #1e40af; margin-top: 8px;">
          <strong>Note:</strong> If your download link expires or fails, you can generate a new one from the Customer Portal or the payment success page.
        </p>
      </div>
      ` : ''}
      
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
        ${
          isOrb
            ? `<li style="margin-bottom: 10px; font-size: 14px;">Download the ORB Bot installer using the button above (or from your payment success page)</li>
        <li style="margin-bottom: 10px; font-size: 14px;">Install and open the app on Windows</li>
        <li style="margin-bottom: 10px; font-size: 14px;">Enter your ORB-prefixed license key</li>
        <li style="margin-bottom: 10px; font-size: 14px;">Connect MT5 and configure ORB session and risk settings</li>
        <li style="margin-bottom: 10px; font-size: 14px;">Test on demo, then go live</li>`
            : `<li style="margin-bottom: 10px; font-size: 14px;">Download the Trading Bot application from our website</li>
        <li style="margin-bottom: 10px; font-size: 14px;">Launch the application on your Windows PC or VPS</li>
        <li style="margin-bottom: 10px; font-size: 14px;">Enter your license key when prompted</li>
        <li style="margin-bottom: 10px; font-size: 14px;">Configure your MT5 and Telegram settings</li>
        <li style="margin-bottom: 10px; font-size: 14px;">Start automating your trades</li>`
        }
      </ol>
      
      <div style="background-color: #fef3c7; border-left: 3px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
        <p style="margin: 0; color: #92400e; font-size: 14px;">
          <strong>Important:</strong> Keep your license key safe and secure. You can use it on one device at a time. 
          If you need to transfer your license to a different device, please contact support.
        </p>
      </div>
    
      <div style="background-color: #dbeafe; border-left: 3px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 4px;">
        <p style="margin: 0; color: #1e40af; font-size: 14px;">
          <strong>Pro Tip:</strong> ${
            isOrb
              ? "Run ORB Bot on a demo account first to validate session times, range logic, and risk settings before live trading."
              : "Start with a demo account to test your signal configurations before going live. This helps you understand SL/TP settings and avoid costly mistakes."
          }
        </p>
      </div>
      
      <h2 style="color: #1f2937; font-size: 18px; margin-top: 32px; margin-bottom: 16px; font-weight: 600;">Need Help?</h2>
      <p style="margin-bottom: 12px; color: #374151; font-size: 14px;">Our support team is here to assist you:</p>
      <ul style="padding-left: 20px; color: #374151;">
        <li style="margin-bottom: 8px; font-size: 14px;">Read our <a href="https://www.signaltradingbots.com/usermanual" style="color: #1f2937; text-decoration: none; font-weight: 600;">User Manual</a> for detailed setup guides</li>
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

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: params.to,
      subject: isOrb
        ? "Your ORB Bot license key — Signal Trading Bots"
        : `Your ${planName} License Key - Signal Trading Bots`,
      html: html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to send Stripe license email", errorText);
    throw new Error(`Failed to send license email: ${errorText}`);
  }
}

/**
 * Send trial ending soon warning email (fires 3 days before trial ends)
 */
export async function sendTrialEndingEmail(params: {
  to: string;
  fullName: string;
  plan: string;
  trialEndDate: Date;
  portalUrl: string;
}): Promise<void> {
  if (!RESEND_API_KEY || !FROM_EMAIL) return;

  const planNames: Record<string, string> = {
    starter_yearly: `Starter Plan ($${PLAN_SALE_USD.starter_yearly}/year)`,
    pro_yearly: `Pro Plan ($${PLAN_SALE_USD.pro_yearly}/year)`,
  };
  const planName = planNames[params.plan.toLowerCase()] || params.plan;
  const endDateStr = params.trialEndDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f9fafb;">
  <div style="background: #ffffff; margin: 40px 20px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: #f59e0b; padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Your Trial Ends in 3 Days</h1>
    </div>
    <div style="padding: 40px 30px;">
      <p style="font-size: 16px; color: #374151;">Hi ${params.fullName},</p>
      <p style="font-size: 15px; color: #374151;">
        Your <strong>${planName}</strong> trial is ending on <strong>${endDateStr}</strong>.
        After that, your subscription will automatically start and you'll be charged the annual fee.
      </p>
      <p style="font-size: 15px; color: #374151;">
        If you'd like to cancel before being charged, you can do so from your customer portal:
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${params.portalUrl}" style="background-color: #1f2937; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 15px;">
          Manage Subscription
        </a>
      </div>
      <p style="font-size: 13px; color: #6b7280;">
        Questions? Reply to this email or contact us at <a href="mailto:${FROM_EMAIL}" style="color: #1f2937;">${FROM_EMAIL}</a>
      </p>
    </div>
    <div style="background: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 12px; color: #6b7280; text-align: center; margin: 0;">
        SignalTradingBots | <a href="https://www.signaltradingbots.com" style="color: #1f2937;">www.signaltradingbots.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: params.to,
      subject: `Your ${planName} trial ends on ${endDateStr} - Signal Trading Bots`,
      html,
    }),
  });

  if (!response.ok) {
    console.error("Failed to send trial ending email:", await response.text());
  }
}
