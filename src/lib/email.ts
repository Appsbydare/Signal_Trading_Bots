import "server-only";

const FROM_EMAIL = process.env.SUPPORT_FROM_EMAIL;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

export async function sendVerificationCodeEmail(params: {
  to: string;
  code: string;
}): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not configured. Verification email will not be sent.");
    throw new Error("Email service not configured");
  }

  if (!FROM_EMAIL) {
    console.warn("SUPPORT_FROM_EMAIL is not configured. Verification email will not be sent.");
    throw new Error("Email service not configured");
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Email Verification Code</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Verify Your Email</h1>
  </div>
  
  <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      Enter this verification code to complete your purchase:
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <div style="background: white; 
                  border: 2px dashed #667eea; 
                  border-radius: 10px; 
                  padding: 20px; 
                  display: inline-block;">
        <p style="margin: 0 0 10px 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px;">
          Your Verification Code
        </p>
        <p style="margin: 0; 
                  font-size: 36px; 
                  font-weight: bold; 
                  letter-spacing: 8px; 
                  color: #667eea;
                  font-family: 'Courier New', monospace;">
          ${params.code}
        </p>
      </div>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px; text-align: center;">
      This code will expire in <strong>15 minutes</strong>
    </p>
    
    <p style="font-size: 14px; color: #666; margin-top: 20px;">
      If you didn't request this code, you can safely ignore this email.
    </p>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #999; text-align: center;">
      © ${new Date().getFullYear()} SignalTradingBots. All rights reserved.<br>
      Need help? Contact support at <a href="mailto:${FROM_EMAIL}" style="color: #667eea;">${FROM_EMAIL}</a>
    </p>
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
      subject: `Your Verification Code: ${params.code}`,
      html,
    }),
  });

  if (!response.ok) {
    console.error("Failed to send verification email", await response.text());
    throw new Error("Failed to send verification email");
  }
}

export async function sendMagicLinkEmail(params: {
  to: string;
  magicLinkUrl: string;
}): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not configured. Magic link email will not be sent.");
    return;
  }

  if (!FROM_EMAIL) {
    console.warn("SUPPORT_FROM_EMAIL is not configured. Magic link email will not be sent.");
    return;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Login to Your Account</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Login to Your Portal</h1>
  </div>
  
  <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      Click the button below to securely log in to your customer portal. This link will expire in 15 minutes.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${params.magicLinkUrl}" 
         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 15px 40px; 
                text-decoration: none; 
                border-radius: 8px; 
                font-weight: bold; 
                display: inline-block;
                font-size: 16px;">
        Access Customer Portal
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      If you didn't request this login link, you can safely ignore this email.
    </p>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #999; text-align: center;">
      © ${new Date().getFullYear()} SignalTradingBots. All rights reserved.<br>
      Need help? Contact support at <a href="mailto:${FROM_EMAIL}" style="color: #667eea;">${FROM_EMAIL}</a>
    </p>
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
      subject: "Login to Your SignalTradingBots Portal",
      html,
    }),
  });

  if (!response.ok) {
    console.error("Failed to send magic link email", await response.text());
    throw new Error("Failed to send magic link email");
  }
}

export async function sendTicketEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn(
      "RESEND_API_KEY is not configured. Ticket email will not be sent.",
    );
    return;
  }

  if (!FROM_EMAIL) {
    console.warn(
      "SUPPORT_FROM_EMAIL is not configured. Ticket email will not be sent.",
    );
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!response.ok) {
    console.error("Failed to send ticket email", await response.text());
  }
}

export async function sendNewDeviceEmail(params: {
  to: string;
  licenseKey: string;
  deviceName: string;
  activatedAt: string;
}): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not configured. New device email will not be sent.");
    return;
  }

  if (!FROM_EMAIL) {
    console.warn("SUPPORT_FROM_EMAIL is not configured. New device email will not be sent.");
    return;
  }

  const activationDate = new Date(params.activatedAt).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Device Activation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">New Device Activation</h1>
  </div>
  
  <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      Your trading bot license was activated on a new device.
    </p>
    
    <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>License Key:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right; font-family: 'Courier New', monospace;">${params.licenseKey}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Device:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${params.deviceName || 'Unknown Device'}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0;"><strong>Activated At:</strong></td>
          <td style="padding: 10px 0; text-align: right;">${activationDate}</td>
        </tr>
      </table>
    </div>
    
    <div style="background-color: #e8f4f8; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #0c4a6e;">
        <strong>Was this you?</strong><br>
        If you activated your license on a new device, you can safely ignore this email.
      </p>
    </div>
    
    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #7f1d1d;">
        <strong>Not you?</strong><br>
        If this wasn't you, please contact our support team immediately at <a href="mailto:${FROM_EMAIL}" style="color: #dc2626;">${FROM_EMAIL}</a>. Your license key may have been compromised.
      </p>
    </div>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #666; text-align: center; margin: 0;">
      Signal Trading Bots Security Team
      <br>
      © ${new Date().getFullYear()} All rights reserved.
    </p>
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
      subject: "New Device Activation Alert - Trading Bot",
      html: html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to send new device email", errorText);
  }
}

export async function sendDuplicateDetectedEmail(params: {
  to: string;
  licenseKey: string;
  deviceName1: string;
  deviceName2: string;
}): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not configured. Duplicate detection email will not be sent.");
    return;
  }

  if (!FROM_EMAIL) {
    console.warn("SUPPORT_FROM_EMAIL is not configured. Duplicate detection email will not be sent.");
    return;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>License Duplicate Usage Detected</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">License Duplicate Usage Detected</h1>
  </div>
  
  <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px; color: #dc2626; font-weight: bold;">
      Your license was used on multiple devices simultaneously.
    </p>
    
    <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
      <p style="margin: 0 0 15px 0;"><strong>License Key:</strong> ${params.licenseKey}</p>
      <p style="margin: 0 0 10px 0;"><strong>Detected on devices:</strong></p>
      <ul style="margin: 0; padding-left: 20px;">
        <li>${params.deviceName1}</li>
        <li>${params.deviceName2}</li>
      </ul>
    </div>
    
    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #856404;">
        <strong>Important:</strong> Your license is restricted to use on one device at a time. 
        This license has been flagged and <strong>grace period has been disabled</strong>.
      </p>
    </div>
    
    <h2 style="color: #667eea; font-size: 18px; margin-top: 30px;">What happens now?</h2>
    <ul style="padding-left: 20px;">
      <li>The license will only work on the first active device</li>
      <li>The second device will be blocked from trading</li>
      <li>No grace period will be provided for this license</li>
    </ul>
    
    <h2 style="color: #667eea; font-size: 18px; margin-top: 30px;">To resolve this:</h2>
    <ol style="padding-left: 20px;">
      <li>Close the trading bot on all devices</li>
      <li>Use the license on only one device at a time</li>
      <li>Contact support if you need to transfer to a different device</li>
    </ol>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="mailto:${FROM_EMAIL}" style="background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        Contact Support
      </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #666; text-align: center; margin: 0;">
      Signal Trading Bots Security Team
      <br>
      © ${new Date().getFullYear()} All rights reserved.
    </p>
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
      subject: "URGENT: License Duplicate Usage Detected",
      html: html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to send duplicate detection email", errorText);
  }
}

export async function sendLicenseEmail(params: {
  to: string;
  licenseKey: string;
  plan: string;
  expiresAt: string;
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
    monthly: "Monthly Plan",
    yearly: "Yearly Plan",
    lifetime: "Lifetime Plan",
    test: "Test License (30 days)",
  };

  const planName = planNames[params.plan] || params.plan;
  const expiryDate = new Date(params.expiresAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
    <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Signal Trading Bots!</h1>
  </div>
  
  <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      Thank you for your purchase! Your trading bot license is ready to use.
    </p>
    
    <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Your License Key:</p>
      <p style="font-size: 24px; font-weight: bold; color: #667eea; font-family: 'Courier New', monospace; margin: 0; letter-spacing: 2px;">
        ${params.licenseKey}
      </p>
    </div>
    
    <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Plan:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${planName}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0;"><strong>Expires:</strong></td>
          <td style="padding: 10px 0; text-align: right;">${expiryDate}</td>
        </tr>
      </table>
    </div>
    
    <h2 style="color: #667eea; font-size: 20px; margin-top: 30px;">Getting Started</h2>
    <ol style="padding-left: 20px;">
      <li style="margin-bottom: 10px;">Download and install the Trading Bot application</li>
      <li style="margin-bottom: 10px;">Launch the application</li>
      <li style="margin-bottom: 10px;">Enter your license key when prompted</li>
      <li style="margin-bottom: 10px;">Configure your MT5 and Telegram settings</li>
      <li style="margin-bottom: 10px;">Start trading!</li>
    </ol>
    
    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #856404;">
        <strong>Important:</strong> Keep your license key safe and secure. You can use it on one device at a time.
      </p>
    </div>
    
    <h2 style="color: #667eea; font-size: 20px; margin-top: 30px;">Need Help?</h2>
    <p style="margin-bottom: 10px;">Our support team is here to assist you:</p>
    <ul style="padding-left: 20px;">
      <li style="margin-bottom: 8px;">Visit our <a href="https://www.signaltradingbots.com/faq" style="color: #667eea;">FAQ page</a></li>
      <li style="margin-bottom: 8px;">Check our <a href="https://www.signaltradingbots.com/resources" style="color: #667eea;">documentation</a></li>
      <li style="margin-bottom: 8px;">Contact us at <a href="mailto:${FROM_EMAIL}" style="color: #667eea;">${FROM_EMAIL}</a></li>
    </ul>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #666; text-align: center; margin: 0;">
      Signal Trading Bots | <a href="https://www.signaltradingbots.com" style="color: #667eea;">www.signaltradingbots.com</a>
      <br>
      © ${new Date().getFullYear()} All rights reserved.
    </p>
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
      subject: "Your Trading Bot License Key",
      html: html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to send license email", errorText);
    throw new Error(`Failed to send license email: ${errorText}`);
  }
}


