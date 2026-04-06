import { NextRequest, NextResponse } from "next/server";
import { runScheduledEmailAutomations } from "@/lib/email-campaigns";

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = request.headers.get("authorization");
  const bearer = header?.replace(/^Bearer\s+/i, "");
  const query = request.nextUrl.searchParams.get("secret");
  return bearer === secret || query === secret;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await runScheduledEmailAutomations();
    return NextResponse.json({ results });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Automation runner failed" }, { status: 500 });
  }
}

export const POST = GET;
