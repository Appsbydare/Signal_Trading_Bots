import { NextRequest, NextResponse } from "next/server";
import { getDownloadToken, markTokenAsUsed } from "@/lib/download-tokens";

/**
 * GET /api/download/[token]
 * Validates download token and redirects to R2 signed URL
 * Enforces single-use by checking token status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: "Download token is required" },
        { status: 400 }
      );
    }

    // Get token from database
    const downloadToken = await getDownloadToken(token);

    if (!downloadToken) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invalid Download Link</title>
            <style>
              body { font-family: system-ui; max-width: 600px; margin: 100px auto; padding: 20px; text-align: center; }
              h1 { color: #dc2626; }
              p { color: #6b7280; margin: 20px 0; }
              a { color: #2563eb; text-decoration: none; }
            </style>
          </head>
          <body>
            <h1>❌ Invalid Download Link</h1>
            <p>This download link is invalid or has been removed.</p>
            <p><a href="/portal">Go to Customer Portal</a></p>
          </body>
        </html>
        `,
        {
          status: 404,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // Check if already used
    if (downloadToken.is_used) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Download Link Already Used</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
              }
              .container {
                background: white;
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                max-width: 500px;
                width: 100%;
                padding: 48px 40px;
                text-align: center;
              }
              .icon {
                width: 80px;
                height: 80px;
                background: #fee;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 24px;
                font-size: 40px;
                color: #dc2626;
              }
              h1 { 
                color: #dc2626;
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 16px;
              }
              p { 
                color: #6b7280;
                line-height: 1.6;
                margin-bottom: 16px;
                font-size: 16px;
              }
              .highlight {
                background: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 16px;
                border-radius: 8px;
                margin: 24px 0;
                text-align: left;
              }
              .highlight p {
                color: #92400e;
                margin: 0;
                font-size: 14px;
              }
              a { 
                display: inline-block;
                background: #2563eb;
                color: white;
                text-decoration: none;
                padding: 14px 32px;
                border-radius: 8px;
                font-weight: 600;
                margin-top: 24px;
                transition: background 0.2s;
              }
              a:hover { background: #1d4ed8; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">⚠</div>
              <h1>Download Link Already Used</h1>
              <p>This download link has already been used and cannot be used again.</p>
              <p>Each download link can only be used once for security reasons.</p>
              <div class="highlight">
                <p><strong>Need to download again?</strong> Generate a new download link from your customer portal.</p>
              </div>
              <a href="/portal">Go to Customer Portal</a>
            </div>
          </body>
        </html>
        `,
        {
          status: 403,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }

    // Check if expired
    const now = new Date();
    const expiresAt = new Date(downloadToken.expires_at);
    if (now > expiresAt) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Download Link Expired</title>
            <style>
              body { font-family: system-ui; max-width: 600px; margin: 100px auto; padding: 20px; text-align: center; }
              h1 { color: #dc2626; }
              p { color: #6b7280; margin: 20px 0; }
              a { color: #2563eb; text-decoration: none; padding: 10px 20px; background: #2563eb; color: white; border-radius: 6px; display: inline-block; margin-top: 20px; }
            </style>
          </head>
          <body>
            <h1>⏱️ Download Link Expired</h1>
            <p>This download link has expired. Download links are valid for 1 hour.</p>
            <p>Please generate a new download link from your customer portal.</p>
            <a href="/portal">Go to Customer Portal</a>
          </body>
        </html>
        `,
        {
          status: 410,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // Mark token as used BEFORE redirecting
    const ipAddress = request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    await markTokenAsUsed(token, ipAddress, userAgent);

    console.log(`✅ Download token ${token} used by ${downloadToken.email}`);

    // Redirect to R2 signed URL
    return NextResponse.redirect(downloadToken.r2_signed_url);

  } catch (error: any) {
    console.error("Error processing download:", error);
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Download Error</title>
          <style>
            body { font-family: system-ui; max-width: 600px; margin: 100px auto; padding: 20px; text-align: center; }
            h1 { color: #dc2626; }
            p { color: #6b7280; margin: 20px 0; }
            a { color: #2563eb; text-decoration: none; }
          </style>
        </head>
        <body>
          <h1>❌ Download Error</h1>
          <p>An error occurred while processing your download request.</p>
          <p>Please try again or contact support if the problem persists.</p>
          <p><a href="/portal">Go to Customer Portal</a></p>
        </body>
      </html>
      `,
      {
        status: 500,
        headers: { "Content-Type": "text/html" },
      }
    );
  }
}
