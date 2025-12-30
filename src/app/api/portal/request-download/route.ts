import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/auth-server";
import { getLicensesForEmail } from "@/lib/license-db";
import { createDownloadToken, getExeFileName } from "@/lib/download-tokens";
import { isR2Enabled } from "@/lib/r2-client";
import { getSupabaseClient } from "@/lib/supabase-storage";
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.SUPPORT_FROM_EMAIL;

/**
 * POST /api/portal/request-download
 * Request a new download link and send it via email
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Check if R2 is configured
    if (!isR2Enabled()) {
      return NextResponse.json(
        { error: "Download service is not configured. Please contact support." },
        { status: 503 }
      );
    }

    // Check if Resend is configured
    if (!RESEND_API_KEY || !FROM_EMAIL) {
      return NextResponse.json(
        { error: "Email service is not configured. Please contact support." },
        { status: 503 }
      );
    }

    // Get customer's licenses
    const licenses = await getLicensesForEmail(customer.email);

    if (licenses.length === 0) {
      return NextResponse.json(
        { error: "No active licenses found. Please purchase a license first." },
        { status: 404 }
      );
    }

    // Get the most recent active license
    const activeLicense = licenses.find(l => l.status === "active");
    if (!activeLicense) {
      return NextResponse.json(
        { error: "No active licenses found. Please contact support." },
        { status: 404 }
      );
    }

    // Get client IP and user agent for audit trail
    const ipAddress = request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Check if user has generated a download link in the last 24 hours
    const client = getSupabaseClient();
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const { data: recentTokens, error: tokenCheckError } = await client
      .from("download_tokens")
      .select("created_at")
      .eq("email", customer.email.toLowerCase())
      .gte("created_at", twentyFourHoursAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (tokenCheckError) {
      console.error("Error checking recent tokens:", tokenCheckError);
    }

    if (recentTokens && recentTokens.length > 0) {
      const lastTokenTime = new Date(recentTokens[0].created_at);
      const hoursRemaining = Math.ceil((lastTokenTime.getTime() + 24 * 60 * 60 * 1000 - Date.now()) / (1000 * 60 * 60));

      return NextResponse.json(
        {
          error: `You can only generate one download link per 24 hours. Please try again in ${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''}.`,
          nextAvailableAt: new Date(lastTokenTime.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        },
        { status: 429 } // Too Many Requests
      );
    }

    // Create download token
    const downloadToken = await createDownloadToken({
      licenseKey: activeLicense.license_key,
      email: customer.email,
      fileName: getExeFileName(),
      ipAddress,
      userAgent,
    });

    // Generate proxy URL
    const host = request.headers.get("host") || "www.signaltradingbots.com";
    const protocol = host.includes("localhost") ? "http" : "https";
    const downloadUrl = `${protocol}://${host}/api/download/${downloadToken.token}`;

    // Send email with download link
    const resend = new Resend(RESEND_API_KEY);

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Download Link</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f9fafb;">
  <div style="background: #ffffff; margin: 40px 20px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: #1f2937; padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 600; letter-spacing: -0.5px;">Download Your Software</h1>
    </div>
  
    <div style="padding: 40px 30px;">
      <p style="font-size: 16px; margin-bottom: 8px; color: #374151;">
        Hi there,
      </p>
      
      <p style="font-size: 16px; margin-bottom: 28px; color: #374151;">
        You requested a download link for the TelegramSignalBot Installer. Click the button below to download:
      </p>

      <!-- Download Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${downloadUrl}" style="background-color: #3b82f6; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 15px;">
          Download Installer
        </a>
      </div>

      <div style="background-color: #fef3c7; border-left: 3px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
        <p style="margin: 0; color: #92400e; font-size: 14px;">
          <strong>Important:</strong> This download link expires in 1 hour and can only be used once for security reasons.
        </p>
      </div>

      <div style="background-color: #dbeafe; border-left: 3px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 4px;">
        <p style="margin: 0; color: #1e40af; font-size: 14px;">
          <strong>Note:</strong> If you need to download again after using this link, you can request a new download link from your customer portal.
        </p>
      </div>

      <h2 style="color: #1f2937; font-size: 18px; margin-top: 32px; margin-bottom: 16px; font-weight: 600;">Your License Information</h2>
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 24px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">License Key</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-family: 'Courier New', monospace; font-size: 13px; color: #1f2937;">${activeLicense.license_key}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">Plan</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #1f2937; font-weight: 600;">${activeLicense.plan}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Status</td>
            <td style="padding: 10px 0; text-align: right; color: #059669; font-weight: 600;">Active</td>
          </tr>
        </table>
      </div>

      <h2 style="color: #1f2937; font-size: 18px; margin-top: 32px; margin-bottom: 16px; font-weight: 600;">Need Help?</h2>
      <p style="margin-bottom: 12px; color: #374151; font-size: 14px;">Our support team is here to assist you:</p>
      <ul style="padding-left: 20px; color: #374151;">
        <li style="margin-bottom: 8px; font-size: 14px;">Visit your <a href="${protocol}://${host}/portal" style="color: #1f2937; text-decoration: none; font-weight: 600;">customer portal</a></li>
        <li style="margin-bottom: 8px; font-size: 14px;">Check our <a href="${protocol}://${host}/resources" style="color: #1f2937; text-decoration: none; font-weight: 600;">documentation</a></li>
        <li style="margin-bottom: 8px; font-size: 14px;">Contact us at <a href="mailto:${FROM_EMAIL}" style="color: #1f2937; text-decoration: none; font-weight: 600;">${FROM_EMAIL}</a></li>
      </ul>
    </div>
    
    <div style="background: #f9fafb; padding: 24px 30px; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 12px; color: #6b7280; text-align: center; margin: 0;">
        SignalTradingBots | <a href="${protocol}://${host}" style="color: #1f2937; text-decoration: none;">${host}</a>
        <br>
        © ${new Date().getFullYear()} All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: customer.email,
      subject: "Your TelegramSignalBot Download Link",
      html: emailHtml,
    });

    console.log(`✅ Download link sent to ${customer.email}`);

    return NextResponse.json({
      success: true,
      message: "Download link has been sent to your email. Please check your inbox (and spam folder).",
      expiresAt: downloadToken.expires_at,
    });

  } catch (error: any) {
    console.error("Error requesting download link:", error);
    return NextResponse.json(
      { error: "Failed to send download link. Please try again or contact support." },
      { status: 500 }
    );
  }
}
